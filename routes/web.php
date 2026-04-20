<?php

use App\Http\Controllers\OrderController;
use App\Http\Controllers\SenderController;
use App\Http\Controllers\ShipmentController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Auth;
// use Illuminate\Container\Attributes\Auth;
use Illuminate\Support\Facades\Route;
// use Laravel\Fortify\Features;

// Route::inertia('/', 'welcome', [
// 'canRegister' => Features::enabled(Features::registration()),
// ])->name('home');

Route::get('/', function () {
    return Auth::check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'main_admin'])->group(function () {
    Route::resource('users', UserController::class);
    Route::resource('senders', SenderController::class);
    Route::resource('shipments', ShipmentController::class)->except('index', 'show');
    Route::resource('orders', OrderController::class)->except('index', 'show');

    Route::get('shipments/{shipment}/export', [ShipmentController::class, 'export'])->name('shipments.export');
});

Route::middleware('auth')->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::resource('shipments', ShipmentController::class)->only(['index', 'show']);
    Route::resource('orders', OrderController::class)->only(['index', 'show']);

    Route::get('shipments/{shipment}/orders/create', [ShipmentController::class, 'createOrder'])->name('shipments.orders.create');
    Route::post('shipments/{shipment}/orders', [ShipmentController::class, 'storeOrder'])->name('shipments.orders.store');
});


require __DIR__ . '/settings.php';
