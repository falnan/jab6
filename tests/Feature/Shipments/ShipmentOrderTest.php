<?php

use App\Models\Order;
use App\Models\Sender;
use App\Models\Shipment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('shipment order create page can be rendered', function () {
    $user = User::factory()->create([
        'name' => 'Input Admin',
    ]);

    $sender = Sender::create([
        'code' => 'SND-0001',
        'name' => 'Pengirim Satu',
    ]);

    $shipment = Shipment::create([
        'code' => 'SHP-ORDER-001',
        'status' => 'pending',
        'shipped_at' => null,
        'arrived_at' => null,
    ]);

    $this->actingAs($user)
        ->get(route('shipments.orders.create', $shipment))
        ->assertSuccessful()
        ->assertInertia(fn(Assert $page) => $page
            ->component('shipments/shipmentorder')
            ->where('shipment.id', $shipment->id)
            ->where('shipment.code', 'SHP-ORDER-001')
            ->where('senders.0.id', $sender->id)
            ->where('senders.0.name', 'Pengirim Satu')
            ->where('user.name', 'Input Admin'));
});

test('shipment order store saves order into opened shipment', function () {
    Storage::fake('public');

    $user = User::factory()->create([
        'name' => 'Petugas Gudang',
    ]);

    $sender = Sender::create([
        'code' => 'SND-0002',
        'name' => 'Pengirim Dua',
    ]);

    $shipment = Shipment::create([
        'code' => 'SHP-ORDER-002',
        'status' => 'pending',
        'shipped_at' => null,
        'arrived_at' => null,
    ]);

    $otherShipment = Shipment::create([
        'code' => 'SHP-ORDER-003',
        'status' => 'pending',
        'shipped_at' => null,
        'arrived_at' => null,
    ]);

    $response = $this->actingAs($user)
        ->post(route('shipments.orders.store', $shipment), [
            'resi' => 'RESI-SHIPMENT-001',
            'sender_id' => $sender->id,
            'recipient_name' => 'Penerima Shipment',
            'image' => UploadedFile::fake()->image('resi-shipment-001.jpg'),
            'note' => 'Order dari halaman shipment.',
            'shipment_id' => $otherShipment->id,
        ]);

    $response->assertRedirect(route('shipments.show', $shipment));

    $order = Order::query()->where('resi', 'RESI-SHIPMENT-001')->first();

    expect($order)->not->toBeNull();
    expect($order->shipment_id)->toBe($shipment->id);
    expect($order->sender_id)->toBe($sender->id);
    expect($order->image_path)->not->toBeNull();
    expect($order->created_by)->toBe($user->id);
    expect($order->created_by_name)->toBe('Petugas Gudang');

    expect(Storage::disk('public')->exists($order->image_path))->toBeTrue();
});
