<?php

namespace Database\Seeders;

use App\Models\Shipment;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ShipmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Shipment::create([
            'code' => 'SHIP001',
            'status' => 'arrived',
            'created_at' => Carbon::now()->subDays(10),
            'shipped_at' => Carbon::now()->subDays(9),
            'arrived_at' => Carbon::now()->subDays(8),
        ]);
        Shipment::create([
            'code' => 'SHIP002',
            'status' => 'arrived',
            'created_at' => Carbon::now()->subDays(9),
            'shipped_at' => Carbon::now()->subDays(8),
            'arrived_at' => Carbon::now()->subDays(7),
        ]);
        Shipment::create([
            'code' => 'SHIP003',
            'status' => 'arrived',
            'created_at' => Carbon::now()->subDays(8),
            'shipped_at' => Carbon::now()->subDays(7),
            'arrived_at' => Carbon::now()->subDays(6),
        ]);
        Shipment::create([
            'code' => 'SHIP004',
            'status' => 'shipped',
            'created_at' => Carbon::now()->subDays(7),
            'shipped_at' => Carbon::now()->subDays(6),
            'arrived_at' => null,
        ]);
        Shipment::create([
            'code' => 'SHIP005',
            'status' => 'pending',
            'created_at' => Carbon::now()->subDays(6),
            'shipped_at' => null,
            'arrived_at' => null,
        ]);
    }
}
