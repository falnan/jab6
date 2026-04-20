<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'role' => 'main_admin',
            'is_active' => true,
            'name' => 'Fadilah Kurniawan',
            'email' => 'falnannn@gmail.com',
            'password' => Hash::make('password'),
        ]);

        User::create([
            'role' => 'main_admin',
            'is_active' => true,
            'name' => 'Zulistya',
            'email' => 'zulistya@gmail.com',
            'password' => Hash::make('password'),
        ]);

        User::create([
            'role' => 'input_admin',
            'is_active' => true,
            'name' => 'Admin Input',
            'email' => 'admininput@gmail.com',
            'password' => Hash::make('password'),
        ]);
    }
}
