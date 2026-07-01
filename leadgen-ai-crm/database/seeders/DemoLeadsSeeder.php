<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Contact;
use App\Models\Activity;
use App\Models\User;
use Carbon\Carbon;

class DemoLeadsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Try to get a user, or create a dummy one if none exists
        $user = User::first();
        if (!$user) {
            $user = User::create([
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'password' => bcrypt('password'),
            ]);
        }

        // --- 1. THE "HOT" LEAD ---
        $hotLead = Contact::create([
            'name' => 'Sarah Jenkins',
            'email' => 'sarah.jenkins@techcorp.com',
            'company' => 'TechCorp Inc.',
            'phone' => '+1 555-0198',
            'status' => 'active',
            'ai_score' => 92,
            'ai_rationale' => 'The contact exhibits extremely strong buying signals by repeatedly visiting the pricing page, downloading the enterprise case study, and actively booking a demo call.',
            'created_by' => $user->id,
            'updated_by' => $user->id,
        ]);

        $this->createActivity($hotLead, $user->id, 'email_open', 'Opened Q3 Newsletter', 5);
        $this->createActivity($hotLead, $user->id, 'page_view', 'Viewed Pricing Page', 4);
        $this->createActivity($hotLead, $user->id, 'download', "Downloaded 'Enterprise CRM' Case Study", 3);
        $this->createActivity($hotLead, $user->id, 'page_view', 'Viewed Pricing Page', 2);
        $this->createActivity($hotLead, $user->id, 'meeting_booked', 'Booked a demo call with Sales', 1);


        // --- 2. THE "COLD" LEAD ---
        $coldLead = Contact::create([
            'name' => 'Mike Thompson',
            'email' => 'm.thompson@random.org',
            'company' => 'Random Org',
            'phone' => '+1 555-0100',
            'status' => 'inactive',
            'ai_score' => 15,
            'ai_rationale' => 'The contact shows no purchase intent. After a single homepage visit, they unsubscribed from all marketing communications and have not returned in over a month.',
            'created_by' => $user->id,
            'updated_by' => $user->id,
        ]);

        $this->createActivity($coldLead, $user->id, 'page_view', 'Visited Homepage', 40);
        $this->createActivity($coldLead, $user->id, 'email_unsubscribe', 'Unsubscribed from Marketing Emails', 38);


        // --- 3. THE "MIXED" LEAD ---
        $mixedLead = Contact::create([
            'name' => 'Alex Rivera',
            'email' => 'arivera@designstudio.io',
            'company' => 'Design Studio',
            'phone' => '+1 555-0122',
            'status' => 'active',
            'ai_score' => 55,
            'ai_rationale' => 'The contact shows moderate, exploratory interest. They frequently read the blog and opened a promotional email, but have not yet viewed pricing or engaged with sales.',
            'created_by' => $user->id,
            'updated_by' => $user->id,
        ]);

        $this->createActivity($mixedLead, $user->id, 'page_view', "Read Blog: '10 CRM Tips'", 10);
        $this->createActivity($mixedLead, $user->id, 'email_open', "Opened 'Spring Promo' Email", 8);
        $this->createActivity($mixedLead, $user->id, 'page_view', "Read Blog: 'Sales vs Marketing'", 5);
    }

    /**
     * Helper to create activities with a simulated date timeline.
     */
    private function createActivity($contact, $userId, $type, $description, $daysAgo)
    {
        Activity::create([
            'contact_id' => $contact->id,
            'user_id' => $userId,
            'type' => $type,
            'description' => $description,
            'performed_at' => Carbon::now()->subDays($daysAgo)->subHours(rand(1, 10)),
        ]);
    }
}
