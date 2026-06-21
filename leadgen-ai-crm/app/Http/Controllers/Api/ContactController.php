<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class ContactController extends Controller
{
    public function index(): JsonResponse
    {
        $user = Auth::user();
        
        $contactsQuery = Contact::with(['createdBy', 'updatedBy'])
            ->orderBy('created_at', 'desc');

        // If user is sales_rep, only show their own contacts
        if ($user->role === User::ROLE_SALES_REP) {
            $contactsQuery->where('created_by', $user->id);
        }
        // Admin can see all contacts (no additional filtering needed)

        $contacts = $contactsQuery->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $contacts,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:contacts,email',
            'company' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
        ]);

        $contact = Contact::create([
            ...$validated,
            'created_by' => Auth::id(),
            'updated_by' => Auth::id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Contact created successfully',
            'data' => $contact->load(['createdBy', 'updatedBy']),
        ], 201);
    }

    public function show(Contact $contact): JsonResponse
    {
        $user = Auth::user();
        
        // Sales reps can only view their own contacts
        if ($user->role === User::ROLE_SALES_REP && $contact->created_by !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }
        
        $contact->load(['createdBy', 'updatedBy']);

        return response()->json([
            'success' => true,
            'data' => $contact,
        ]);
    }

    public function update(Request $request, Contact $contact): JsonResponse
    {
        $user = Auth::user();
        
        // Sales reps can only update their own contacts
        if ($user->role === User::ROLE_SALES_REP && $contact->created_by !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:contacts,email,' . $contact->id,
            'company' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
        ]);

        $contact->update([
            ...$validated,
            'updated_by' => Auth::id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Contact updated successfully',
            'data' => $contact->load(['createdBy', 'updatedBy']),
        ]);
    }

    public function destroy(Contact $contact): JsonResponse
    {
        $user = Auth::user();
        
        // Sales reps can only delete their own contacts
        if ($user->role === User::ROLE_SALES_REP && $contact->created_by !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }
        
        $contact->delete();

        return response()->json([
            'success' => true,
            'message' => 'Contact deleted successfully',
        ]);
    }
}
