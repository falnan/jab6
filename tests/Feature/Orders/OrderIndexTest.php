<?php

use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('orders index page can be rendered with order data', function () {
    $order = Order::factory()->create([
        'resi' => 'RESI-ORDER-001',
        'recipient_name' => 'Budi Santoso',
        'image_path' => 'orders/resi-order-001.jpg',
        'note' => 'Perlu dicek ulang sebelum dikirim',
        'created_by' => null,
        'sender_id' => null,
        'shipment_id' => null,
        'created_by_name' => 'Admin Gudang',
        'created_at' => now()->subDay(),
    ]);

    $this->get(route('orders.index'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('orders/index')
            ->has('orders.data', 1)
            ->where('orders.data.0.id', $order->id)
            ->where('orders.data.0.resi', 'RESI-ORDER-001')
            ->where('orders.data.0.recipient_name', 'Budi Santoso')
            ->where('orders.data.0.has_image', 1)
            ->where('orders.data.0.note', 'Perlu dicek ulang sebelum dikirim'),
        );
});

test('orders index can filter orders by resi and date range', function () {
    $matchingOrder = Order::factory()->create([
        'resi' => 'RESI-FILTER-001',
        'recipient_name' => 'Siti Aminah',
        'created_by' => null,
        'sender_id' => null,
        'shipment_id' => null,
        'created_by_name' => 'Admin Filter',
        'created_at' => now()->subDays(2),
    ]);

    Order::factory()->create([
        'resi' => 'RESI-LAIN-999',
        'recipient_name' => 'Tidak Masuk Filter',
        'created_by' => null,
        'sender_id' => null,
        'shipment_id' => null,
        'created_by_name' => 'Admin Filter',
        'created_at' => now()->subDays(10),
    ]);

    $this->get(route('orders.index', [
        'search' => 'RESI-FILTER',
        'date_from' => now()->subDays(3)->toDateString(),
        'date_to' => now()->subDay()->toDateString(),
    ]))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('orders/index')
            ->has('orders.data', 1)
            ->where('orders.data.0.id', $matchingOrder->id)
            ->where('orders.data.0.resi', 'RESI-FILTER-001'),
        );
});
