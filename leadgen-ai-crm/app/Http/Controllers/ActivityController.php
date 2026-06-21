<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreActivityRequest;
use App\Models\Activity;
use App\Models\Contact;
use App\Models\User;
use App\Services\ActivityService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ActivityController extends Controller
{
    private ActivityService $activityService;

    public function __construct(ActivityService $activityService)
    {
        $this->activityService = $activityService;
    }

    public function index(Request $request)
    {
        $user = Auth::user();

        $query = Activity::with(['contact', 'user'])
            ->orderBy('performed_at', 'desc');

        $contactsQuery = Contact::query()->orderBy('name');

        if ($user->role === User::ROLE_SALES_REP) {
            // Sales reps only see activities on their contacts
            $query->whereHas('contact', function ($q) use ($user) {
                $q->where('created_by', $user->id);
            });
            $contactsQuery->where('created_by', $user->id);
        }

        if ($request->has('contact_id') && $request->contact_id) {
            $query->where('contact_id', $request->contact_id);
        }

        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }

        $activities = $query->paginate(20)->withQueryString();
        $contacts = $contactsQuery->get(['id', 'name']);

        return \Inertia\Inertia::render('Activities/Index', [
            'activities' => $activities,
            'contacts' => $contacts,
            'filters' => $request->only(['contact_id', 'type']),
        ]);
    }

    public function store(StoreActivityRequest $request, Contact $contact)
    {
        $user = Auth::user();
        
        if ($user->role === User::ROLE_SALES_REP && $contact->created_by !== $user->id) {
            abort(403, 'Unauthorized');
        }

        $this->activityService->createActivity($contact, $request->validated());

        return back()->with('success', 'Activity logged successfully');
    }

    public function destroy(Activity $activity)
    {
        $user = Auth::user();
        $contact = $activity->contact;
        
        if ($user->role === User::ROLE_SALES_REP && $contact->created_by !== $user->id) {
            abort(403, 'Unauthorized');
        }

        $this->activityService->deleteActivity($activity);

        return back()->with('success', 'Activity deleted successfully');
    }
}
