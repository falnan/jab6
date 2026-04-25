<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\DB;

class InvalidateOtherSessions
{
    /**
     * Delete all other active sessions for the user when they log in.
     */
    public function handle(Login $event): void
    {
        $currentSessionId = request()->session()->getId();

        DB::table('sessions')
            ->where('user_id', $event->user->getAuthIdentifier())
            ->where('id', '!=', $currentSessionId)
            ->delete();
    }
}
