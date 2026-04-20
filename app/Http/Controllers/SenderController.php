<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSenderRequest;
use App\Http\Requests\UpdateSenderRequest;
use App\Models\Sender;
use Inertia\Inertia;

class SenderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $senders = Sender::select('id', 'code', 'name')
            ->latest()
            ->paginate(10);

        return Inertia::render('senders/index', [
            'senders' => $senders,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('senders/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSenderRequest $request)
    {
        Sender::create($request->validated());

        return redirect()->route('senders.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Sender $sender)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Sender $sender)
    {
        return Inertia::render('senders/edit', [
            'sender' => $sender,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSenderRequest $request, Sender $sender)
    {
        $sender->update($request->validated());

        return redirect()->route('senders.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Sender $sender)
    {
        $sender->delete();

        return redirect()->route('senders.index');
    }
}
