<?php

use App\Exports\ShipmentOrdersExport;
use App\Models\Order;
use App\Models\Shipment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Maatwebsite\Excel\Facades\Excel;

uses(RefreshDatabase::class);

test('shipment show page displays only orders belonging to the shipment', function () {
    $user = User::factory()->create(['role' => 'input_admin']);

    $shipment = Shipment::create([
        'code' => 'SHP-UT-001',
        'status' => 'pending',
        'shipped_at' => null,
        'arrived_at' => null,
    ]);

    $otherShipment = Shipment::create([
        'code' => 'SHP-UT-002',
        'status' => 'pending',
        'shipped_at' => null,
        'arrived_at' => null,
    ]);

    $firstOrder = Order::factory()->create([
        'resi' => 'RESI-SHP-001',
        'recipient_name' => 'Penerima Satu',
        'shipment_id' => $shipment->id,
        'created_by' => null,
        'sender_id' => null,
        'created_by_name' => 'Tester',
    ]);

    $secondOrder = Order::factory()->create([
        'resi' => 'RESI-SHP-002',
        'recipient_name' => 'Penerima Dua',
        'shipment_id' => $shipment->id,
        'created_by' => null,
        'sender_id' => null,
        'created_by_name' => 'Tester',
    ]);

    Order::factory()->create([
        'resi' => 'RESI-SHP-LAIN',
        'recipient_name' => 'Penerima Lain',
        'shipment_id' => $otherShipment->id,
        'created_by' => null,
        'sender_id' => null,
        'created_by_name' => 'Tester',
    ]);

    $this->actingAs($user)->get(route('shipments.show', $shipment))
        ->assertSuccessful()
        ->assertInertia(
            fn(Assert $page) => $page
                ->component('shipments/show')
                ->where('shipment.id', $shipment->id)
                ->has('orders.data', 2)
                ->where('user.role', 'input_admin')
                ->where('orders.data', fn($rows) => collect($rows)
                    ->pluck('id')
                    ->sort()
                    ->values()
                    ->all() === [$firstOrder->id, $secondOrder->id])
        );
});

test('shipment export route returns forbidden for non-main-admin users', function () {
    $user = User::factory()->create(['role' => 'input_admin']);

    $shipment = Shipment::create([
        'code' => 'SHP-FORBIDDEN-001',
        'status' => 'pending',
        'shipped_at' => null,
        'arrived_at' => null,
    ]);

    $this->actingAs($user)->get(route('shipments.export', $shipment))
        ->assertForbidden();
});

test('shipment export route downloads excel file for main-admin', function () {
    Excel::fake();

    $user = User::factory()->create(['role' => 'main_admin']);

    $shipment = Shipment::create([
        'code' => 'SHP-EXP-001',
        'status' => 'pending',
        'shipped_at' => null,
        'arrived_at' => null,
    ]);

    Order::factory()->create([
        'resi' => 'RESI-EXPORT-001',
        'shipment_id' => $shipment->id,
        'created_by' => null,
        'sender_id' => null,
        'created_by_name' => 'Exporter',
    ]);

    Order::factory()->create([
        'resi' => 'RESI-EXPORT-002',
        'shipment_id' => $shipment->id,
        'created_by' => null,
        'sender_id' => null,
        'created_by_name' => 'Exporter',
    ]);

    $otherShipment = Shipment::create([
        'code' => 'SHP-EXP-002',
        'status' => 'pending',
        'shipped_at' => null,
        'arrived_at' => null,
    ]);

    Order::factory()->create([
        'resi' => 'RESI-EXPORT-LAIN',
        'shipment_id' => $otherShipment->id,
        'created_by' => null,
        'sender_id' => null,
        'created_by_name' => 'Exporter',
    ]);

    $this->actingAs($user)->get(route('shipments.export', $shipment))
        ->assertSuccessful();

    Excel::assertDownloaded('orders-shp-exp-001.xlsx', function (ShipmentOrdersExport $export) {
        return $export->collection()->pluck('resi')->sort()->values()->all() === [
            'RESI-EXPORT-001',
            'RESI-EXPORT-002',
        ];
    });
});;
