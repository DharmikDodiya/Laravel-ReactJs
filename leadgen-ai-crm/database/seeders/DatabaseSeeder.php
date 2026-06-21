<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $adminEmail = env('ADMIN_EMAIL');

        if ($adminEmail) {
            User::query()->updateOrCreate(
                ['email' => $adminEmail],
                [
                    'name' => 'CRM Admin',
                    'role' => User::ROLE_ADMIN,
                    'password' => bcrypt(env('ADMIN_PASSWORD', 'changeme_' . bin2hex(random_bytes(4)))),
                ],
            );
        }
    }
}
