<?php

use App\Models\Order;
use App\Models\Shipment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));

    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard with metrics data', function () {
    Cache::flush();

    $user = User::factory()->create();

    Shipment::query()->create([
        'code' => 'SHP-OLD',
        'status' => 'pending',
        'created_at' => now()->subDays(2),
        'updated_at' => now()->subDays(2),
    ]);

    Shipment::query()->create([
        'code' => 'SHP-ARRIVED',
        'status' => 'arrived',
        'created_at' => now()->subDay(),
        'updated_at' => now()->subDay(),
    ]);

    $latestShipment = Shipment::query()->create([
        'code' => 'SHP-NEWEST',
        'status' => 'shipped',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    Order::factory()->create([
        'shipment_id' => $latestShipment->id,
        'sender_id' => null,
        'created_by' => null,
        'created_by_name' => 'Tester',
        'created_at' => now()->subDays(1),
    ]);

    Order::factory()->create([
        'shipment_id' => $latestShipment->id,
        'sender_id' => null,
        'created_by' => null,
        'created_by_name' => 'Tester',
        'created_at' => now(),
    ]);

    $this->actingAs($user);

    $response = $this->get(route('dashboard'));

    $response
        ->assertOk()
        ->assertInertia(
            fn(Assert $page) => $page
                ->component('dashboard')
                ->where('dashboard.latest_shipment_code', 'SHP-NEWEST')
                ->where('dashboard.latest_shipment_package_total', 2)
                ->where('dashboard.completed_shipment_total', 2)
                ->has('dashboard.packages_last_7_days', 7),
        );

    expect(Cache::has('dashboard:orders:summary:v2'))->toBeTrue();
});
