<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('users and senders resource routes are protected by auth and main_admin middleware', function () {
    $routeNames = [
        'users.index',
        'users.create',
        'users.store',
        'users.show',
        'users.edit',
        'users.update',
        'users.destroy',
        'senders.index',
        'senders.create',
        'senders.store',
        'senders.show',
        'senders.edit',
        'senders.update',
        'senders.destroy',
    ];

    foreach ($routeNames as $routeName) {
        $route = app('router')->getRoutes()->getByName($routeName);

        expect($route)->not->toBeNull();
        expect($route->gatherMiddleware())->toContain('auth');
        expect($route->gatherMiddleware())->toContain('main_admin');
    }
});

test('guests are redirected when accessing users and senders index', function () {
    $this->get(route('users.index'))->assertRedirect(route('login'));
    $this->get(route('senders.index'))->assertRedirect(route('login'));
});

test('input admin can not access users and senders index', function () {
    $inputAdmin = User::factory()->create([
        'role' => 'input_admin',
    ]);

    $this->actingAs($inputAdmin)->get(route('users.index'))->assertForbidden();
    $this->actingAs($inputAdmin)->get(route('senders.index'))->assertForbidden();
});

test('main admin can access users and senders index', function () {
    $mainAdmin = User::factory()->create([
        'role' => 'main_admin',
    ]);

    $this->actingAs($mainAdmin)->get(route('users.index'))->assertOk();
    $this->actingAs($mainAdmin)->get(route('senders.index'))->assertOk();
});
