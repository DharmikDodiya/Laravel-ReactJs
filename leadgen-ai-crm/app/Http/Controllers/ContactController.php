<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\User;
use App\Services\ActivityService;
use App\Services\AIScoringService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class ContactController extends Controller
{
    public function __construct(
        private ActivityService  $activityService,
        private AIScoringService $aiScoringService,
    ) {}

    public function index(Request $request)
    {
        $user = Auth::user();

        $contactsQuery = Contact::with(['createdBy', 'updatedBy'])
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->has('search') && $request->search) {
            $searchTerm = $request->search;
            $contactsQuery->where(function($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('email', 'like', "%{$searchTerm}%")
                  ->orWhere('company', 'like', "%{$searchTerm}%");
            });
        }

        if ($request->has('status') && $request->status) {
            $contactsQuery->where('status', $request->status);
        }

        // If user is sales_rep, only show their own contacts
        if ($user->role === User::ROLE_SALES_REP) {
            $contactsQuery->where('created_by', $user->id);
        }
        // Admin can see all contacts (no additional filtering needed)

        $contacts = $contactsQuery->paginate(15)->withQueryString();

        return Inertia::render('Contacts/Index', [
            'contacts' => $contacts,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function show(Contact $contact)
    {
        $user = Auth::user();

        // Sales reps can only view their own contacts
        if ($user->role === User::ROLE_SALES_REP && $contact->created_by !== $user->id) {
            abort(403, 'Unauthorized');
        }

        $contact->load(['createdBy', 'updatedBy']);
        $activities = $this->activityService->getActivitiesForContact($contact, 50);
        $stats = $this->activityService->getActivityStats($contact);

        return Inertia::render('Contacts/Show', [
            'contact' => $contact,
            'activities' => $activities,
            'stats' => $stats,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email:rfc,dns|unique:contacts,email',
            'company' => 'nullable|string|max:255',
            'phone' => 'nullable|string|regex:/^([0-9\s\-\+\(\)]*)$/|min:10|max:20',
            'status' => 'nullable|string|max:50',
        ]);

        Contact::create([
            ...$validated,
            'created_by' => Auth::id(),
            'updated_by' => Auth::id(),
        ]);

        return redirect()->route('contacts.index')
            ->with('success', 'Contact created successfully');
    }

    public function update(Request $request, Contact $contact)
    {
        $user = Auth::user();

        // Sales reps can only update their own contacts
        if ($user->role === User::ROLE_SALES_REP && $contact->created_by !== $user->id) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email:rfc,dns|unique:contacts,email,' . $contact->id,
            'company' => 'nullable|string|max:255',
            'phone' => 'nullable|string|regex:/^([0-9\s\-\+\(\)]*)$/|min:10|max:20',
            'status' => 'nullable|string|max:50',
        ]);

        $contact->update([
            ...$validated,
            'updated_by' => Auth::id(),
        ]);

        return redirect()->route('contacts.index')
            ->with('success', 'Contact updated successfully');
    }

    public function destroy(Contact $contact)
    {
        $user = Auth::user();

        // Sales reps can only delete their own contacts
        if ($user->role === User::ROLE_SALES_REP && $contact->created_by !== $user->id) {
            abort(403, 'Unauthorized');
        }

        $contact->delete();

        return redirect()->route('contacts.index')
            ->with('success', 'Contact deleted successfully');
    }

    /**
     * Manually trigger AI score recalculation for a contact.
     * Called by the "Refresh Score" button on the lead detail page.
     */
    public function refreshScore(Contact $contact)
    {
        $user = Auth::user();

        if ($user->role === User::ROLE_SALES_REP && $contact->created_by !== $user->id) {
            abort(403, 'Unauthorized');
        }

        $this->aiScoringService->updateContactScore($contact);

        return back()->with('success', 'AI score refreshed successfully.');
    }
}
