<?php

use App\Models\Shipment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('creating a shipment defaults status to pending', function () {
    $user = User::factory()->create(['role' => 'main_admin']);

    $response = $this->actingAs($user)->post(route('shipments.store'), [
        'code' => 'SHP-NEW-001',
    ]);

    $response->assertRedirect(route('shipments.index'));

    $shipment = Shipment::query()->where('code', 'SHP-NEW-001')->first();

    expect($shipment)->not->toBeNull();
    expect($shipment->status)->toBe('pending');
    expect($shipment->shipped_at)->toBeNull();
    expect($shipment->arrived_at)->toBeNull();
});

test('creating a shipment requires a code', function () {
    $user = User::factory()->create(['role' => 'main_admin']);

    $response = $this->actingAs($user)
        ->from(route('shipments.create'))
        ->post(route('shipments.store'), [
            'code' => '',
        ]);

    $response->assertRedirect(route('shipments.create'));
    $response->assertSessionHasErrors(['code']);

    expect(Shipment::query()->count())->toBe(0);
});
