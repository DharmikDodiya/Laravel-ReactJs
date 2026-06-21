<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreActivityRequest;
use App\Http\Requests\UpdateActivityRequest;
use App\Models\Activity;
use App\Models\Contact;
use App\Models\User;
use App\Services\ActivityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class ActivityController extends Controller
{
    private ActivityService $activityService;

    public function __construct(ActivityService $activityService)
    {
        $this->activityService = $activityService;
    }

    public function index(Contact $contact): JsonResponse
    {
        $user = Auth::user();
        
        if ($user->role === User::ROLE_SALES_REP && $contact->created_by !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $activities = $this->activityService->getActivitiesForContact($contact);
        $stats = $this->activityService->getActivityStats($contact);

        return response()->json([
            'success' => true,
            'data' => $activities,
            'stats' => $stats,
        ]);
    }

    public function store(StoreActivityRequest $request, Contact $contact): JsonResponse
    {
        $user = Auth::user();
        
        if ($user->role === User::ROLE_SALES_REP && $contact->created_by !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $activity = $this->activityService->createActivity($contact, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Activity logged successfully',
            'data' => $activity->load(['user']),
        ], 201);
    }

    public function show(Contact $contact, Activity $activity): JsonResponse
    {
        $user = Auth::user();
        
        if ($user->role === User::ROLE_SALES_REP && $contact->created_by !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        if ($activity->contact_id !== $contact->id) {
            return response()->json([
                'success' => false,
                'message' => 'Activity not found for this contact',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $activity->load(['user']),
        ]);
    }

    public function update(UpdateActivityRequest $request, Contact $contact, Activity $activity): JsonResponse
    {
        $user = Auth::user();
        
        if ($user->role === User::ROLE_SALES_REP && $contact->created_by !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        if ($activity->contact_id !== $contact->id) {
            return response()->json([
                'success' => false,
                'message' => 'Activity not found for this contact',
            ], 404);
        }

        $activity = $this->activityService->updateActivity($activity, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Activity updated successfully',
            'data' => $activity->load(['user']),
        ]);
    }

    public function destroy(Contact $contact, Activity $activity): JsonResponse
    {
        $user = Auth::user();
        
        if ($user->role === User::ROLE_SALES_REP && $contact->created_by !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        if ($activity->contact_id !== $contact->id) {
            return response()->json([
                'success' => false,
                'message' => 'Activity not found for this contact',
            ], 404);
        }

        $this->activityService->deleteActivity($activity);

        return response()->json([
            'success' => true,
            'message' => 'Activity deleted successfully',
        ]);
    }
}
