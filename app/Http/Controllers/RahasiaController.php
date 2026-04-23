<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class RahasiaController extends Controller
{
    public function index(Request $request): InertiaResponse
    {
        $orders = $this->filteredSoftDeletedOrdersQuery($request)
            ->select(['id', 'resi', 'recipient_name', 'note', 'created_at', 'deleted_at'])
            ->selectRaw("CASE WHEN image_path IS NOT NULL AND image_path != '' THEN 1 ELSE 0 END as has_image")
            ->orderByDesc('created_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('rahasia', [
            'orders' => $orders,
        ]);
    }

    public function export(Request $request): BinaryFileResponse
    {
        $rows = $this->filteredSoftDeletedOrdersQuery($request)
            ->select(['resi', 'recipient_name', 'note', 'created_at', 'deleted_at'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function (Order $order): array {
                return [
                    'resi' => $order->resi,
                    'recipient_name' => $order->recipient_name,
                    'note' => $order->note,
                    'created_at' => $order->created_at?->timezone('Asia/Jakarta')->format('Y-m-d H:i:s'),
                    'deleted_at' => $order->deleted_at?->timezone('Asia/Jakarta')->format('Y-m-d H:i:s'),
                ];
            });

        $fileName = 'Order-Terhapus-'.now('Asia/Jakarta')->format('Ymd-His').'.xlsx';

        return Excel::download(new class($rows) implements FromCollection, ShouldAutoSize, WithHeadings
        {
            public function __construct(private readonly Collection $rows) {}

            public function collection(): Collection
            {
                return $this->rows;
            }

            public function headings(): array
            {
                return [
                    'Resi',
                    'Nama Penerima',
                    'Catatan',
                    'Dibuat Pada (WIB)',
                    'Dihapus Pada (WIB)',
                ];
            }
        }, $fileName);
    }

    public function destroyAllSoftDeleted(): RedirectResponse
    {
        Order::onlyTrashed()->forceDelete();

        return back()->with('success', 'Semua data order terhapus permanen berhasil dibersihkan.');
    }

    private function filteredSoftDeletedOrdersQuery(Request $request): Builder
    {
        return Order::query()
            ->onlyTrashed()
            ->when($request->search, function (Builder $q, string $search): void {
                $q->where('resi', 'like', "{$search}%");
            })
            ->when(
                $request->filled('date_from') || $request->filled('date_to'),
                function (Builder $q) use ($request): void {
                    $from = $request->filled('date_from')
                        ? Carbon::parse($request->date_from, 'Asia/Jakarta')->startOfDay()
                        : null;

                    $to = $request->filled('date_to')
                        ? Carbon::parse($request->date_to, 'Asia/Jakarta')->endOfDay()
                        : null;

                    if ($from && ! $to) {
                        $q->where('created_at', '>=', $from->utc());

                        return;
                    }

                    if (! $from && $to) {
                        $q->where('created_at', '<=', $to->utc());

                        return;
                    }

                    $q->whereBetween('created_at', [$from?->utc(), $to?->utc()]);
                }
            );
    }
}
