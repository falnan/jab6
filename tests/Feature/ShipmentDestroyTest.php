<?php

use App\Models\Order;
use App\Models\Shipment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

test('deleting shipment removes related orders and their images', function () {
    Storage::fake('public');

    $mainAdmin = User::factory()->create([
        'role' => 'main_admin',
    ]);

    $shipment = Shipment::query()->create([
        'code' => 'SHP-DEL-001',
        'status' => 'pending',
        'shipped_at' => null,
        'arrived_at' => null,
    ]);

    $otherShipment = Shipment::query()->create([
        'code' => 'SHP-KEEP-001',
        'status' => 'pending',
        'shipped_at' => null,
        'arrived_at' => null,
    ]);

    $firstImage = 'orders/images/delete-first.jpg';
    $secondImage = 'orders/images/delete-second.jpg';
    $otherImage = 'orders/images/keep-image.jpg';

    Storage::disk('public')->put($firstImage, 'first');
    Storage::disk('public')->put($secondImage, 'second');
    Storage::disk('public')->put($otherImage, 'other');

    $orderToDeleteOne = Order::factory()->create([
        'shipment_id' => $shipment->id,
        'image_path' => $firstImage,
        'sender_id' => null,
        'created_by' => $mainAdmin->id,
    ]);

    $orderToDeleteTwo = Order::factory()->create([
        'shipment_id' => $shipment->id,
        'image_path' => $secondImage,
        'sender_id' => null,
        'created_by' => $mainAdmin->id,
    ]);

    $orderToKeep = Order::factory()->create([
        'shipment_id' => $otherShipment->id,
        'image_path' => $otherImage,
        'sender_id' => null,
        'created_by' => $mainAdmin->id,
    ]);

    $response = $this->actingAs($mainAdmin)
        ->delete(route('shipments.destroy', $shipment));

    $response->assertRedirect(route('shipments.index'));

    expect(Shipment::query()->whereKey($shipment->id)->exists())->toBeFalse();
    expect(Order::query()->whereKey($orderToDeleteOne->id)->exists())->toBeFalse();
    expect(Order::query()->whereKey($orderToDeleteTwo->id)->exists())->toBeFalse();
    expect(Order::query()->whereKey($orderToKeep->id)->exists())->toBeTrue();

    expect(Storage::disk('public')->exists($firstImage))->toBeFalse();
    expect(Storage::disk('public')->exists($secondImage))->toBeFalse();
    expect(Storage::disk('public')->exists($otherImage))->toBeTrue();
});
