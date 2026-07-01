<?php

namespace App\Services;

use App\Models\Contact;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Constants\AIPrompts;

class AIScoringService
{
    /**
     * Recalculate score + rationale and persist on the contact record.
     * Tries Gemini first; falls back to heuristic if API is unavailable.
     */
    public function updateContactScore(Contact $contact): void
    {
        $result = $this->calculateScore($contact);

        $contact->updateQuietly([
            'ai_score'     => $result['score'],
            'ai_rationale' => $result['rationale'],
        ]);

        Log::info('AI Score successfully calculated and saved.', [
            'provider'   => $result['provider'] ?? 'unknown',
            'contact_id' => $contact->id,
            'score'      => $result['score'],
            'rationale'  => $result['rationale']
        ]);
    }

    /**
     * Calculate score + rationale. Returns ['score' => int, 'rationale' => string].
     */
    public function calculateScore(Contact $contact): array
    {
        $counts = $this->getActivityCounts($contact->id);

        // No activities — return 0, skip API call
        if ($counts['total'] === 0) {
            return [
                'score'     => 0,
                'rationale' => 'This lead has no recorded engagement history. Recommend initiating contact via email or a discovery call.',
                'provider'  => 'heuristic',
            ];
        }

        $provider = config('services.active_ai');

        if ($provider === 'groq') {
            $apiKey = config('services.groq.api_key');
            if (!$apiKey) {
                return ['score' => 0, 'rationale' => 'Groq API Key is not configured in settings.', 'provider' => 'error'];
            }
            try {
                $result = $this->scoreWithGroq($contact, $counts, $apiKey);
                $result['provider'] = 'groq';
                return $result;
            } catch (\Throwable $e) {
                Log::error('Groq AI Scoring Failed', ['contact_id' => $contact->id, 'error' => $e->getMessage()]);
                return ['score' => 0, 'rationale' => 'AI Provider Error: ' . $e->getMessage(), 'provider' => 'error'];
            }
        } elseif ($provider === 'anthropic') {
            $apiKey = config('services.anthropic.api_key');
            if (!$apiKey) {
                return ['score' => 0, 'rationale' => 'Anthropic API Key is not configured in settings.', 'provider' => 'error'];
            }
            try {
                $result = $this->scoreWithAnthropic($contact, $counts, $apiKey);
                $result['provider'] = 'anthropic';
                return $result;
            } catch (\Throwable $e) {
                Log::error('Anthropic AI Scoring Failed', ['contact_id' => $contact->id, 'error' => $e->getMessage()]);
                return ['score' => 0, 'rationale' => 'AI Provider Error: ' . $e->getMessage(), 'provider' => 'error'];
            }
        }

        return ['score' => 0, 'rationale' => 'No active AI provider configured.', 'provider' => 'error'];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Groq AI scoring (OpenAI-compatible)
    // ─────────────────────────────────────────────────────────────────────────

    private function scoreWithGroq(Contact $contact, array $counts, string $apiKey): array
    {
        $model = config('services.groq.model', 'llama-3.3-70b-versatile');
        $prompt = $this->buildPrompt($contact, $counts);

        $response = Http::withToken($apiKey)
            ->timeout(15)
            ->post('https://api.groq.com/openai/v1/chat/completions', [
                'model' => $model,
                'messages' => [
                    ['role' => 'system', 'content' => AIPrompts::SYSTEM_PROMPT_DEFAULT],
                    ['role' => 'user', 'content' => $prompt]
                ],
                'temperature' => 0.0,
                'response_format' => ['type' => 'json_object']
            ]);

        if ($response->failed()) {
            throw new \RuntimeException(
                'Groq API error: ' . $response->status() . ' — ' . $response->body()
            );
        }

        $text = $response->json('choices.0.message.content') ?? '';

        $text = preg_replace('/^```json\s*/i', '', trim($text));
        $text = preg_replace('/\s*```$/', '', $text);

        $parsed = json_decode($text, true);

        if (!isset($parsed['score'], $parsed['rationale'])) {
            throw new \RuntimeException('Groq returned unexpected JSON: ' . $text);
        }

        $score = max(0, min(100, (int) round($parsed['score'])));

        return [
            'score'     => $score,
            'rationale' => trim($parsed['rationale']),
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Anthropic AI scoring
    // ─────────────────────────────────────────────────────────────────────────

    private function scoreWithAnthropic(Contact $contact, array $counts, string $apiKey): array
    {
        $model = config('services.anthropic.model', 'claude-3-haiku-20240307');
        $prompt = $this->buildPrompt($contact, $counts);

        $response = Http::withHeaders([
                'x-api-key' => $apiKey,
                'anthropic-version' => '2023-06-01',
                'content-type' => 'application/json',
            ])
            ->timeout(15)
            ->post('https://api.anthropic.com/v1/messages', [
                'model' => $model,
                'max_tokens' => 300,
                'system' => AIPrompts::SYSTEM_PROMPT_ANTHROPIC,
                'messages' => [
                    ['role' => 'user', 'content' => $prompt]
                ],
                'temperature' => 0.0,
            ]);

        if ($response->failed()) {
            throw new \RuntimeException(
                'Anthropic API error: ' . $response->status() . ' — ' . $response->body()
            );
        }

        $text = $response->json('content.0.text') ?? '';

        // Strip markdown code fences if Anthropic wraps the JSON
        $text = preg_replace('/^```json\s*/i', '', trim($text));
        $text = preg_replace('/\s*```$/', '', $text);

        $parsed = json_decode($text, true);

        if (!isset($parsed['score'], $parsed['rationale'])) {
            throw new \RuntimeException('Anthropic returned unexpected JSON: ' . $text);
        }

        $score = max(0, min(100, (int) round($parsed['score'])));

        return [
            'score'     => $score,
            'rationale' => trim($parsed['rationale']),
        ];
    }

    private function buildPrompt(Contact $contact, array $counts): string
    {
        $activities = DB::table('activities')
            ->where('contact_id', $contact->id)
            ->orderByDesc('performed_at')
            ->limit(20)
            ->get(['type', 'description', 'performed_at']);

        $activityLines = $activities->map(function ($a) {
            $date = date('Y-m-d', strtotime($a->performed_at));
            $type = str_replace('_', ' ', $a->type);
            $desc = $a->description ? " — \"{$a->description}\"" : '';
            return "  • [{$date}] {$type}{$desc}";
        })->implode("\n");

        return AIPrompts::buildLeadScoringPrompt(
            $contact->name,
            $contact->company ?? 'Unknown',
            $contact->status ?? 'New',
            $counts['email_opened'],
            $counts['page_visited'],
            $counts['call_logged'],
            $counts['total'],
            $activityLines
        );
    }



    // ─────────────────────────────────────────────────────────────────────────
    // Shared helpers
    // ─────────────────────────────────────────────────────────────────────────

    private function getActivityCounts(int $contactId): array
    {
        $rows = DB::table('activities')
            ->select('type', DB::raw('COUNT(*) as total'))
            ->where('contact_id', $contactId)
            ->groupBy('type')
            ->pluck('total', 'type');

        // Handle both older and newer activity type namings
        $email = (int) ($rows['email_opened'] ?? $rows['email_open'] ?? 0);
        $page  = (int) ($rows['page_visited'] ?? $rows['page_view'] ?? 0);
        $call  = (int) ($rows['call_logged'] ?? $rows['meeting_booked'] ?? 0);
        
        $total = DB::table('activities')->where('contact_id', $contactId)->count();

        return [
            'email_opened' => $email,
            'page_visited' => $page,
            'call_logged'  => $call,
            'total'        => $total,
        ];
    }
}
