<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

test('logging in invalidates all other sessions for the same user', function () {
    $user = User::factory()->create();

    DB::table('sessions')->insert([
        'id' => 'old-session-id-abc',
        'user_id' => $user->id,
        'ip_address' => '192.168.1.1',
        'user_agent' => 'Mozilla/5.0',
        'payload' => base64_encode(serialize([])),
        'last_activity' => now()->timestamp,
    ]);

    $this->assertDatabaseHas('sessions', ['id' => 'old-session-id-abc']);

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $this->assertDatabaseMissing('sessions', ['id' => 'old-session-id-abc']);
});

test('logging in does not remove sessions of other users', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();

    DB::table('sessions')->insert([
        'id' => 'other-user-session-xyz',
        'user_id' => $userB->id,
        'ip_address' => '10.0.0.1',
        'user_agent' => 'Mozilla/5.0',
        'payload' => base64_encode(serialize([])),
        'last_activity' => now()->timestamp,
    ]);

    $this->post(route('login.store'), [
        'email' => $userA->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $this->assertDatabaseHas('sessions', ['id' => 'other-user-session-xyz']);
});
