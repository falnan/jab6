<?php

use App\Models\Order;
use App\Models\Shipment;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('updating shipment code syncs related orders in the same shipment', function () {
    $shipment = Shipment::query()->create([
        'code' => 'SHP-OLD-001',
        'status' => 'pending',
        'shipped_at' => null,
        'arrived_at' => null,
    ]);

    $otherShipment = Shipment::query()->create([
        'code' => 'SHP-OTHER-001',
        'status' => 'pending',
        'shipped_at' => null,
        'arrived_at' => null,
    ]);

    $affectedOrder = Order::factory()->create([
        'shipment_id' => $shipment->id,
        'sender_id' => null,
        'created_by' => null,
        'updated_at' => now()->subDay(),
    ]);

    $unaffectedOrder = Order::factory()->create([
        'shipment_id' => $otherShipment->id,
        'sender_id' => null,
        'created_by' => null,
        'updated_at' => now()->subDay(),
    ]);

    $affectedOrderInitialUpdatedAt = $affectedOrder->updated_at->copy();
    $unaffectedOrderInitialUpdatedAt = $unaffectedOrder->updated_at->copy();

    $response = $this->put(route('shipments.update', $shipment), [
        'code' => 'SHP-NEW-001',
        'status' => 'pending',
        'shipped_at' => null,
        'arrived_at' => null,
    ]);

    $response->assertRedirect(route('shipments.index'));

    $shipment->refresh();
    $affectedOrder->refresh();
    $unaffectedOrder->refresh();

    expect($shipment->code)->toBe('SHP-NEW-001');
    expect($affectedOrder->shipment_id)->toBe($shipment->id);
    expect($affectedOrder->updated_at->timestamp)
        ->toBeGreaterThan($affectedOrderInitialUpdatedAt->timestamp);
    expect($unaffectedOrder->updated_at->timestamp)
        ->toBe($unaffectedOrderInitialUpdatedAt->timestamp);
});

test('updating shipment without code change does not touch related orders timestamp', function () {
    $shipment = Shipment::query()->create([
        'code' => 'SHP-SAME-001',
        'status' => 'pending',
        'shipped_at' => null,
        'arrived_at' => null,
    ]);

    $order = Order::factory()->create([
        'shipment_id' => $shipment->id,
        'sender_id' => null,
        'created_by' => null,
        'updated_at' => now()->subDay(),
    ]);

    $orderInitialUpdatedAt = $order->updated_at->copy();

    $response = $this->put(route('shipments.update', $shipment), [
        'code' => 'SHP-SAME-001',
        'status' => 'shipped',
        'shipped_at' => null,
        'arrived_at' => null,
    ]);

    $response->assertRedirect(route('shipments.index'));

    $order->refresh();

    expect($order->updated_at->timestamp)->toBe($orderInitialUpdatedAt->timestamp);
});
