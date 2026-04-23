<?php

namespace App\Http\Controllers;

use App\Exports\ShipmentOrdersExport;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\StoreShipmentRequest;
use App\Http\Requests\UpdateShipmentRequest;
use App\Models\Order;
use App\Models\Sender;
use App\Models\Shipment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ShipmentController extends Controller
{
    public function index()
    {
        $shipments = Shipment::latest()->paginate(6);

        return Inertia::render('shipments/index', [
            'shipments' => $shipments,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('shipments/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreShipmentRequest $request)
    {
        Shipment::create([
            ...$request->validated(),
            'status' => 'pending',
        ]);

        return redirect()->route('shipments.index')->with('success', 'Shipment created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Shipment $shipment)
    {
        $orders = $shipment->orders()
            ->select(['id', 'resi', 'recipient_name', 'note', 'created_at'])
            ->selectRaw("CASE WHEN image_path IS NOT NULL AND image_path != '' THEN 1 ELSE 0 END as has_image")
            ->when($request->search, function ($query, $search) {
                $query->where('resi', 'like', "{$search}%");
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

        return Inertia::render('shipments/show', [
            'shipment' => $shipment,
            'orders' => $orders,
            'user' => $request->user(),
        ]);
    }

    /**
     * Show the form for adding a new order to this shipment.
     */
    public function createOrder(Request $request, Shipment $shipment)
    {
        if ($shipment->status !== 'pending') {
            if (Auth::user()->role !== 'main_admin') {
                abort(403);
            }
        }

        return Inertia::render('shipments/shipmentordercreate', [
            'shipment' => $shipment->only(['id', 'code', 'status']),
            'senders' => Sender::query()
                ->select(['id', 'code', 'name'])
                ->orderBy('name')
                ->get(),
            'user' => $request->user()?->only(['id', 'name']),
        ]);
    }

    /**
     * Store a new order under the specified shipment.
     */
    public function storeOrder(StoreOrderRequest $request, Shipment $shipment)
    {
        if ($shipment->status !== 'pending') {
            if (Auth::user()->role !== 'main_admin') {
                abort(403);
            }
        }

        $validated = $request->validated();

        $user = $request->user();
        $imagePath = null;

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $safeResi = Str::slug($validated['resi']);
            $extension = $file->getClientOriginalExtension();
            $fileName = $safeResi.'.'.$extension;
            $imagePath = $file->storeAs('orders/images', $fileName, 'public');
        }

        Order::create([
            'resi' => $validated['resi'],
            'recipient_name' => $validated['recipient_name'],
            'image_path' => $imagePath,
            'note' => $validated['note'] ?? null,
            'sender_id' => $validated['sender_id'] ?? null,
            'shipment_id' => $shipment->id,
            'created_by' => $user?->id,
            'created_by_name' => $user?->name ?? 'System',
        ]);

        return redirect()
            ->route('shipments.show', $shipment)
            ->with('success', 'Order berhasil ditambahkan ke shipment.');
    }

    /**
     * Export shipment orders to Excel.
     */
    public function export(Shipment $shipment)
    {
        $orders = $shipment->orders()
            ->select(['id', 'resi', 'recipient_name', 'note', 'created_at', 'sender_id'])
            ->with('sender_relation:id,name')
            ->orderByDesc('created_at')
            ->get();

        $safeCode = str($shipment->code)->replace(' ', '-')->lower();
        $fileName = sprintf('Paket-%s.xlsx', $safeCode);

        return Excel::download(new ShipmentOrdersExport($shipment, $orders), $fileName);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Shipment $shipment)
    {
        return Inertia::render('shipments/edit', [
            'shipment' => $shipment,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateShipmentRequest $request, Shipment $shipment)
    {
        $shipment->update($request->validated());

        return redirect()->route('shipments.index')->with('success', 'Shipment updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Shipment $shipment)
    {
        $orders = $shipment->orders()->select(['id', 'image_path'])->get();

        foreach ($orders as $order) {
            if ($order->image_path) {
                Storage::disk('public')->delete($order->image_path);
            }
        }

        $shipment->orders()->delete();
        $shipment->delete();

        return redirect()->route('shipments.index')->with('success', 'Shipment deleted successfully.');
    }
}
