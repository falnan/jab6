<?php

use App\Models\Order;
use App\Models\Sender;
use App\Models\Shipment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('orders show page includes sender name and created by name from order column', function () {
    $sender = Sender::query()->create([
        'code' => 'SND-001',
        'name' => 'Sender Satu',
    ]);

    $shipment = Shipment::query()->create([
        'code' => 'SHP-001',
        'status' => 'pending',
    ]);

    $order = Order::factory()->create([
        'resi' => 'RESI-SHOW-001',
        'recipient_name' => 'Budi Show',
        'image_path' => 'orders/resi-show-001.jpg',
        'note' => 'Catatan show',
        'created_by' => null,
        'sender_id' => $sender->id,
        'shipment_id' => $shipment->id,
        'created_by_name' => 'Nama Penginput Kolom',
    ]);

    $this->get(route('orders.show', $order))
        ->assertSuccessful()
        ->assertInertia(fn(Assert $page) => $page
            ->component('orders/show')
            ->where('order.id', $order->id)
            ->where('order.sender_name', 'Sender Satu')
            ->where('order.created_by_name', 'Nama Penginput Kolom')
            ->where('order.shipment_code', 'SHP-001')
            ->where('order.image_path', 'orders/resi-show-001.jpg'));
});
