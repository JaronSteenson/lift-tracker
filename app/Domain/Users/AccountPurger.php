<?php

namespace LiftTracker\Domain\Users;

use Illuminate\Support\Facades\DB;
use LiftTracker\User;

class AccountPurger
{
    public function purge(User $user): void
    {
        $sql = file_get_contents(__DIR__ . '/account-purge.sql');

        DB::delete($sql, [$user->id]);
    }
}
