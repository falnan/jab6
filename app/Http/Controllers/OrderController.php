<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Models\Order;
use App\Models\Sender;
use App\Models\Shipment;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Inertia\Inertia;

class OrderController extends Controller
{
    private const DASHBOARD_CACHE_KEY = 'dashboard:orders:summary:v2';

    public function dashboard()
    {
        return Inertia::render('dashboard', [
            'dashboard' => $this->dashboardSummary(),
        ]);
    }

    public function refreshDashboardCache(): void
    {
        Cache::put(
            self::DASHBOARD_CACHE_KEY,
            $this->buildDashboardSummary(),
            $this->dashboardCacheExpiresAt(),
        );
    }

    private function dashboardSummary(): array
    {
        return Cache::remember(
            self::DASHBOARD_CACHE_KEY,
            $this->dashboardCacheExpiresAt(),
            fn() => $this->buildDashboardSummary(),
        );
    }

    private function dashboardCacheExpiresAt(): CarbonInterface
    {
        $nowInJakarta = now('Asia/Jakarta');
        $expiresAt = $nowInJakarta->copy()->setTime(23, 59, 0);

        if ($nowInJakarta->greaterThanOrEqualTo($expiresAt)) {
            $expiresAt->addDay();
        }

        return $expiresAt;
    }

    private function buildDashboardSummary(): array
    {
        $latestShipment = Shipment::query()
            ->select(['id', 'code'])
            ->latest('id')
            ->first();

        $latestShipmentPackageTotal = 0;

        if ($latestShipment !== null) {
            $latestShipmentPackageTotal = Order::query()
                ->where('shipment_id', $latestShipment->id)
                ->count();
        }

        $completedShipmentTotal = Shipment::query()
            ->whereIn('status', ['shipped', 'arrived'])
            ->count();

        $endDate = now('Asia/Jakarta')->startOfDay();
        $startDate = $endDate->copy()->subDays(6);

        $dailyPackageCounts = Order::query()
            ->selectRaw('DATE(created_at) as order_date, COUNT(*) as total')
            ->whereBetween('created_at', [
                $startDate->copy()->startOfDay()->utc(),
                $endDate->copy()->endOfDay()->utc(),
            ])
            ->groupByRaw('DATE(created_at)')
            ->pluck('total', 'order_date');

        $packagesByDay = [];

        for ($day = $startDate->copy(); $day->lte($endDate); $day = $day->addDay()) {
            $dateKey = $day->format('Y-m-d');

            $packagesByDay[] = [
                'date' => $dateKey,
                'label' => $day->format('d M'),
                'total' => (int) ($dailyPackageCounts[$dateKey] ?? 0),
            ];
        }

        return [
            'latest_shipment_code' => $latestShipment?->code,
            'latest_shipment_package_total' => $latestShipmentPackageTotal,
            'completed_shipment_total' => $completedShipmentTotal,
            'packages_last_7_days' => $packagesByDay,
        ];
    }

    public function index(Request $request)
    {
        $orders = Order::select(['id', 'resi', 'recipient_name', 'note', 'created_at'])
            ->selectRaw("CASE WHEN image_path IS NOT NULL AND image_path != '' THEN 1 ELSE 0 END as has_image")
            ->when($request->search, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('resi', 'like', "{$search}%");
                    // ->orWhere('recipient_name', 'like', "{$search}%");
                });
            })
            ->when(true, function ($q) use ($request) {
                $from = $request->filled('date_from')
                    ? Carbon::parse($request->date_from, 'Asia/Jakarta')->startOfDay()
                    : Carbon::now('Asia/Jakarta')->startOfDay();

                $to = $request->filled('date_to')
                    ? Carbon::parse($request->date_to, 'Asia/Jakarta')->endOfDay()
                    : Carbon::now('Asia/Jakarta')->endOfDay();

                // jika hanya salah satu diisi, tetap fleksibel
                if ($request->filled('date_from') && ! $request->filled('date_to')) {
                    $q->where('created_at', '>=', $from->utc());

                    return;
                }

                if (! $request->filled('date_from') && $request->filled('date_to')) {
                    $q->where('created_at', '<=', $to->utc());

                    return;
                }

                $q->whereBetween('created_at', [$from->utc(), $to->utc()]);
            })
            ->orderByDesc('created_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('orders/index', [
            'orders' => $orders,
        ]);
    }

    public function create()
    {
        abort(404);
    }

    public function store(StoreOrderRequest $request)
    {
        abort(404);
    }

    public function show(Order $order)
    {
        $coba = $order->load(['sender_relation:id,name', 'shipment_relation:id,code']);

        return Inertia::render('orders/show', [
            'order' => $order,
        ]);
    }

    public function edit(Order $order)
    {
        $order->load([
            'created_by_relation:id,name',
            'sender_relation:id,code,name',
            'shipment_relation:id,code',
        ]);

        return Inertia::render('orders/edit', [
            'order' => $order,
            'senders' => Sender::query()->select(['id', 'code', 'name'])->orderBy('name')->get(),
            // hanya kirim shipments dengan status pending atau shipped
            'shipments' => Shipment::query()->select(['id', 'code'])->whereIn('status', ['pending', 'shipped'])->orderByDesc('created_at')->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateOrderRequest $request, Order $order)
    {
        $validated = $request->validated();

        $imagePath = $order->image_path;

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $safeResi = Str::slug($validated['resi']);
            $extension = $file->getClientOriginalExtension();
            $fileName = $safeResi . '.' . $extension;
            $imagePath = $file->storeAs('orders/images', $fileName, 'public');
        }

        $order->update([
            'resi' => $validated['resi'],
            'recipient_name' => $validated['recipient_name'],
            'image_path' => $imagePath,
            'note' => $validated['note'] ?? null,
            'sender_id' => $validated['sender_id'] ?? null,
            'shipment_id' => $validated['shipment_id'] ?? null,
        ]);

        return redirect()->route('orders.index')->with('success', 'Order updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $order)
    {
        $order->delete();

        return redirect()->route('orders.index')->with('success', 'Order deleted successfully.');
    }
}
