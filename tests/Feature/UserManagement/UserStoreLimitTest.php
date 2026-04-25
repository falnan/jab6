<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('store allows creating a user when fewer than 5 users exist', function () {
    $mainAdmin = User::factory()->create(['role' => 'main_admin']);
    User::factory()->count(3)->create();

    $this->actingAs($mainAdmin)
        ->post(route('users.store'), [
            'name' => 'New Admin',
            'email' => 'newadmin@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'input_admin',
            'is_active' => true,
        ])
        ->assertRedirect(route('users.index'));

    expect(User::count())->toBe(5);
});

test('store rejects creating a user when 5 users already exist', function () {
    $mainAdmin = User::factory()->create(['role' => 'main_admin']);
    User::factory()->count(4)->create();

    expect(User::count())->toBe(5);

    $this->actingAs($mainAdmin)
        ->post(route('users.store'), [
            'name' => 'Extra Admin',
            'email' => 'extra@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'input_admin',
            'is_active' => true,
        ])
        ->assertSessionHasErrors(['limit']);

    expect(User::count())->toBe(5);
});
