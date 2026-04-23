<?php

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Maatwebsite\Excel\Facades\Excel;

uses(RefreshDatabase::class);

test('rahasia index shows only soft deleted orders', function () {
    $user = User::factory()->create(['role' => 'main_admin']);

    $deletedOrder = Order::factory()->create([
        'resi' => 'RESI-RAHASIA-001',
        'recipient_name' => 'Penerima Rahasia',
        'created_at' => now()->subDays(10),
        'created_by' => null,
        'sender_id' => null,
        'shipment_id' => null,
    ]);
    $deletedOrder->delete();

    Order::factory()->create([
        'resi' => 'RESI-AKTIF-001',
        'recipient_name' => 'Order Aktif',
        'created_by' => null,
        'sender_id' => null,
        'shipment_id' => null,
    ]);

    $this->actingAs($user)
        ->get(route('rahasia'))
        ->assertSuccessful()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('rahasia')
                ->has('orders.data', 1)
                ->where('orders.data.0.resi', 'RESI-RAHASIA-001')
                ->where('orders.data.0.deleted_at', fn ($value) => filled($value)),
        );
});

test('rahasia export downloads excel based on active filters', function () {
    Excel::fake();

    Carbon::setTestNow(Carbon::parse('2026-04-21 10:11:12', 'Asia/Jakarta'));

    $user = User::factory()->create(['role' => 'main_admin']);

    $includedOrder = Order::factory()->create([
        'resi' => 'RESI-EXPORT-OK',
        'recipient_name' => 'Masuk Export',
        'created_at' => Carbon::parse('2026-04-20 08:00:00', 'Asia/Jakarta')->utc(),
        'created_by' => null,
        'sender_id' => null,
        'shipment_id' => null,
    ]);
    $includedOrder->delete();

    $excludedOrder = Order::factory()->create([
        'resi' => 'RESI-EXPORT-NO',
        'recipient_name' => 'Tidak Masuk',
        'created_at' => Carbon::parse('2026-04-01 08:00:00', 'Asia/Jakarta')->utc(),
        'created_by' => null,
        'sender_id' => null,
        'shipment_id' => null,
    ]);
    $excludedOrder->delete();

    $this->actingAs($user)->get(route('rahasia.export', [
        'search' => 'RESI-EXPORT-OK',
        'date_from' => '2026-04-20',
        'date_to' => '2026-04-20',
    ]))->assertSuccessful();

    Excel::assertDownloaded('Order-Terhapus-20260421-101112.xlsx', function ($export) {
        $rows = $export->collection();

        return $rows->count() === 1
            && $rows->first()['resi'] === 'RESI-EXPORT-OK'
            && $rows->first()['recipient_name'] === 'Masuk Export';
    });

    Carbon::setTestNow();
});

test('rahasia clear soft deleted removes all trashed orders permanently', function () {
    $user = User::factory()->create(['role' => 'main_admin']);

    $firstDeleted = Order::factory()->create([
        'created_by' => null,
        'sender_id' => null,
        'shipment_id' => null,
    ]);
    $firstDeleted->delete();

    $secondDeleted = Order::factory()->create([
        'created_by' => null,
        'sender_id' => null,
        'shipment_id' => null,
    ]);
    $secondDeleted->delete();

    $activeOrder = Order::factory()->create([
        'created_by' => null,
        'sender_id' => null,
        'shipment_id' => null,
    ]);

    $this->actingAs($user)
        ->delete(route('rahasia.destroy-all-soft-deleted'))
        ->assertRedirect();

    expect(Order::withTrashed()->find($firstDeleted->id))->toBeNull();
    expect(Order::withTrashed()->find($secondDeleted->id))->toBeNull();
    expect(Order::find($activeOrder->id))->not->toBeNull();
});
