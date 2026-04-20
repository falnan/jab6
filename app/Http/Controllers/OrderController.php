<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Models\Order;
use App\Models\Sender;
use App\Models\Shipment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
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
                if ($request->filled('date_from') && !$request->filled('date_to')) {
                    $q->where('created_at', '>=', $from->utc());
                    return;
                }

                if (!$request->filled('date_from') && $request->filled('date_to')) {
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
            //hanya kirim shipments dengan status pending atau shipped
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
            $imagePath = $request->file('image')->store('orders/images', 'public');
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
