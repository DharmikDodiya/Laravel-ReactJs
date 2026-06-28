<?php

use App\Http\Controllers\ContactController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserManagementController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    $user = Auth::user();
    $isSalesRep = $user->role === \App\Models\User::ROLE_SALES_REP;

    $contacts = \App\Models\Contact::with(['createdBy'])
        ->when($isSalesRep, fn($q) => $q->where('created_by', $user->id))
        ->orderBy('updated_at', 'desc')
        ->paginate(10);

    // KPI stats — fresh queries to avoid builder state conflicts
    $baseQuery = fn() => \App\Models\Contact::when($isSalesRep, fn($q) => $q->where('created_by', $user->id));

    $totalContacts = $baseQuery()->count();
    $closedWon     = $baseQuery()->where('status', 'Closed Won')->count();
    $highPriority  = $baseQuery()->where('ai_score', '>=', 70)->count();

    return Inertia::render('Dashboard', [
        'contacts' => $contacts,
        'stats'    => [
            'total_contacts' => $totalContacts,
            'closed_won'     => $closedWon,
            'high_priority'  => $highPriority,
        ],
    ]);
})->middleware(['auth', 'verified', 'role:admin,sales_rep'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

use App\Http\Controllers\ActivityController;

Route::middleware(['auth', 'verified', 'role:admin,sales_rep'])->group(function () {
    Route::resource('contacts', ContactController::class);
    Route::post('/contacts/{contact}/activities', [ActivityController::class, 'store'])->name('contacts.activities.store');
    Route::post('/contacts/{contact}/refresh-score', [ContactController::class, 'refreshScore'])->name('contacts.refresh-score');
    Route::delete('/activities/{activity}', [ActivityController::class, 'destroy'])->name('activities.destroy');
    Route::get('/activities', [ActivityController::class, 'index'])->name('activities.index');
    
});

Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    // Project Settings Route
    Route::get('/settings', [UserManagementController::class, 'index'])->name('settings.index');
    Route::patch('/users/{user}/role', [UserManagementController::class, 'updateRole'])->name('users.update-role');
});

require __DIR__ . '/auth.php';
