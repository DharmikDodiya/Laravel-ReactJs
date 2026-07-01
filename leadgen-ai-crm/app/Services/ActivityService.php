<?php

namespace App\Services;

use App\Models\Activity;
use App\Models\Contact;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ActivityService
{
    public function __construct(private AIScoringService $aiScoringService) {}

    public function getActivitiesForContact(Contact $contact, int $perPage = 10): LengthAwarePaginator
    {
        return $contact->activities()
            ->with('user')
            ->orderBy('performed_at', 'desc')
            ->paginate($perPage);
    }

    public function createActivity(Contact $contact, array $data): Activity
    {
        $activity = Activity::create([
            'contact_id'   => $contact->id,
            'user_id'      => auth()->id() ?? $contact->created_by,
            'type'         => $data['type'],
            'description'  => $data['description'] ?? null,
            'metadata'     => $data['metadata'] ?? [],
            'performed_at' => $data['performed_at'] ?? now(),
        ]);

        // Score recalculates from fresh DB counts — never stale
        $this->aiScoringService->updateContactScore($contact);

        return $activity;
    }

    public function updateActivity(Activity $activity, array $data): Activity
    {
        $activity->update([
            'type'         => $data['type']         ?? $activity->type,
            'description'  => $data['description']  ?? $activity->description,
            'metadata'     => $data['metadata']      ?? $activity->metadata,
            'performed_at' => $data['performed_at']  ?? $activity->performed_at,
        ]);

        $this->aiScoringService->updateContactScore($activity->contact);

        return $activity->fresh();
    }

    public function deleteActivity(Activity $activity): bool
    {
        // Capture contact BEFORE deleting — once deleted, $activity->contact is null
        $contact = $activity->contact;

        $deleted = $activity->delete();

        // Scoring uses DB aggregates, so count is already correct after delete
        $this->aiScoringService->updateContactScore($contact);

        return (bool) $deleted;
    }

    public function getActivityStats(Contact $contact): array
    {
        $counts = DB::table('activities')
            ->select('type', DB::raw('COUNT(*) as total'))
            ->where('contact_id', $contact->id)
            ->groupBy('type')
            ->pluck('total', 'type');

        // Handle both older and newer activity type namings for frontend display
        $emailCount = (int) ($counts['email_opened'] ?? $counts['email_open'] ?? 0);
        $pageCount  = (int) ($counts['page_visited'] ?? $counts['page_view'] ?? 0);
        $callCount  = (int) ($counts['call_logged'] ?? $counts['meeting_booked'] ?? 0);
        
        // Exclude specific named types to find 'other' if needed, or simply sum
        // But for standard CRM, total is just total rows
        $total = DB::table('activities')->where('contact_id', $contact->id)->count();

        $lastActivity = DB::table('activities')
            ->where('contact_id', $contact->id)
            ->orderByDesc('performed_at')
            ->value('performed_at');

        return [
            'total'       => $total,
            'by_type'     => [
                'email_opened' => $emailCount,
                'page_visited' => $pageCount,
                'call_logged'  => $callCount,
                'other'        => max(0, $total - ($emailCount + $pageCount + $callCount)),
            ],
            'last_activity' => $lastActivity,
        ];
    }
}
