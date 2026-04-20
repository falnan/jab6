<?php

namespace App\Exports;

use App\Models\Shipment;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ShipmentOrdersExport implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping
{
    public function __construct(
        protected Shipment $shipment,
        protected Collection $orders,
    ) {}

    public function collection(): Collection
    {
        return $this->orders;
    }

    public function headings(): array
    {
        return [
            'No',
            'Resi',
            'Nama Penerima',
            'Ekspedisi',
            'Dibuat Pada',
            'Catatan',
        ];
    }

    public function map($row): array
    {
        static $number = 0;
        $number++;

        return [
            $number,
            $row->resi,
            $row->recipient_name,
            $row->sender_relation?->name ?? '-',
            optional($row->created_at)?->format('d-m-Y H:i:s'),
            filled($row->note) ? $row->note : '-',
        ];
    }
}
