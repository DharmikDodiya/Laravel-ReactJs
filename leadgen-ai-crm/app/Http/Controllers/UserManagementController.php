<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Settings/Index', [
            'users' => User::query()
                ->select(['id', 'name', 'email', 'role', 'created_at'])
                ->orderBy('name')
                ->get(),
            'roles' => [
                User::ROLE_ADMIN,
                User::ROLE_SALES_REP,
            ],
            'currentUserId' => $request->user()->id,
            'aiSettings' => [
                'active_ai_provider' => config('services.active_ai'),
                'anthropic_api_key' => config('services.anthropic.api_key'),
                'anthropic_model' => config('services.anthropic.model'),
                'groq_api_key' => config('services.groq.api_key'),
                'groq_model' => config('services.groq.model'),
            ],
        ]);
    }

    public function updateRole(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'role' => 'required|string|in:' . implode(',', [User::ROLE_ADMIN, User::ROLE_SALES_REP]),
        ]);

        // Avoid locking the application by removing the last admin.
        if ($user->role === User::ROLE_ADMIN && $validated['role'] !== User::ROLE_ADMIN) {
            $adminCount = User::query()->where('role', User::ROLE_ADMIN)->count();
            if ($adminCount <= 1) {
                return back()->with('error', 'At least one admin user is required.');
            }
        }

        $user->update(['role' => $validated['role']]);

        return back()->with('success', "Role updated for {$user->name}.");
    }

    public function updateAiSettings(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'active_ai_provider' => 'required|in:groq,anthropic',
            'anthropic_api_key' => 'nullable|string',
            'anthropic_model' => 'nullable|string',
            'groq_api_key' => 'nullable|string',
            'groq_model' => 'nullable|string',
        ]);

        $envPath = base_path('.env');
        $envContent = file_get_contents($envPath);

        $keys = [
            'ACTIVE_AI_PROVIDER' => $validated['active_ai_provider'],
            'ANTHROPIC_API_KEY' => $validated['anthropic_api_key'] ?? '',
            'ANTHROPIC_MODEL' => $validated['anthropic_model'] ?? 'claude-3-haiku-20240307',
            'GROQ_API_KEY' => $validated['groq_api_key'] ?? '',
            'GROQ_MODEL' => $validated['groq_model'] ?? 'llama-3.3-70b-versatile',
        ];

        foreach ($keys as $key => $value) {
            // Escape double quotes if present
            $value = str_replace('"', '\"', $value);
            
            if (preg_match("/^{$key}=/m", $envContent)) {
                $envContent = preg_replace("/^{$key}=.*/m", "{$key}=\"{$value}\"", $envContent);
            } else {
                $envContent .= "\n{$key}=\"{$value}\"";
            }
        }

        file_put_contents($envPath, $envContent);

        return back()->with('success', 'AI settings updated successfully.');
    }
}
