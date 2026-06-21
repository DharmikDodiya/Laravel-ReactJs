<?php

namespace App\Constants;

class AIPrompts
{
    public const SYSTEM_PROMPT_DEFAULT = 'You are a helpful B2B sales AI assistant. Always output valid JSON.';
    public const SYSTEM_PROMPT_ANTHROPIC = 'You are a helpful B2B sales AI assistant. Always output valid JSON only, without any markdown formatting or extra text.';

    public const LEAD_SCORING_PROMPT = <<<PROMPT
You are a B2B sales AI assistant. Analyse the following lead's engagement data and return a JSON object.

## Lead
- Name: %s
- Company: %s
- Status: %s

## Activity Summary
- Emails opened : %d
- Pages visited : %d
- Calls logged  : %d
- Total         : %d

## Recent Activity Log (most recent first)
%s

## Instructions
Based on the engagement data above, return ONLY a valid JSON object — no markdown, no explanation outside the JSON:

{
  "score": <integer 0–100 representing purchase intent>,
  "rationale": "<2–3 sentence explanation of the score and recommended next action>"
}

Scoring guide:
- 80–100: Strong intent (multiple calls, high page engagement, recent activity)
- 50–79: Moderate engagement (email opens, some page visits)
- 20–49: Weak signals (few activities, no calls)
- 0–19: Cold lead (no meaningful engagement)
PROMPT;

    public static function buildLeadScoringPrompt(string $name, string $company, string $status, int $emails, int $pages, int $calls, int $total, string $activityLines): string
    {
        return sprintf(
            self::LEAD_SCORING_PROMPT,
            $name,
            $company,
            $status,
            $emails,
            $pages,
            $calls,
            $total,
            $activityLines
        );
    }
}
