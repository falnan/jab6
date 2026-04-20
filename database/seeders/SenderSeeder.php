<?php

namespace Database\Seeders;

use App\Models\Sender;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SenderSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            [
                'code' => 'JNT',
                'name' => 'J&T Express',
            ],
            [
                'code' => 'JNE',
                'name' => 'Jalur Nugraha Ekakurir',
            ],
            [
                'code' => 'SICEPAT',
                'name' => 'SiCepat Ekspres',
            ],
            [
                'code' => 'POS',
                'name' => 'POS Indonesia',
            ],
            [
                'code' => 'TIKI',
                'name' => 'Citra Van Titipan Kilat',
            ],
            [
                'code' => 'Wahana',
                'name' => 'Wahana Prestasi Logistik',
            ],
            [
                'code' => 'Ninja',
                'name' => 'Ninja Xpress',
            ],
            [
                'code' => 'Anteraja',
                'name' => 'AnterAja Antar Cepat Indonesia',
            ],
            [
                'code' => 'Lion Parcel',
                'name' => 'Lion Parcel Express',
            ],
            [
                'code' => 'lainnya',
                'name' => 'Lainnya',
            ]
        ];

        foreach ($data as $sender) {
            Sender::create($sender);
        }
    }
}
