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

}
