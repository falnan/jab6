<?php

namespace App\Http\Controllers;

use App\Http\Requests\Users\StoreUserRequest;
use App\Http\Requests\Users\UpdateUserRequest;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class UserController extends Controller
{

    public function index()
    {
        $users = User::select('id', 'name', 'email', 'role', 'is_active')
            ->latest()
            ->paginate(10);

        return Inertia::render('users/index', [
            'users' => $users,
        ]);
    }

    public function create()
    {
        return Inertia::render('users/create');
    }

    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();
        User::create($data);

        return redirect()->route('users.index')->with('success', 'User created successfully.');
    }

    public function show(string $id)
    {
        abort(Response::HTTP_NOT_FOUND);
    }

    public function edit(string $id)
    {
        return Inertia::render('users/edit', [
            'user' => User::findOrFail($id),
        ]);
    }

    public function update(UpdateUserRequest $request, string $id)
    {

        $data = $request->validated();
        $user = User::findOrFail($id);
        if (empty($data['password'])) {
            unset($data['password']);
        } else {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);

        return redirect()->route('users.index')->with('success', 'User updated successfully.');
    }

    public function destroy(string $id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return redirect()->route('users.index')->with('success', 'User deleted successfully.');
    }
}
