<?php


namespace LiftTracker\Domain\Users;

use LiftTracker\User;

interface UserOwnershipInterface
{
    public function isOwnedBy(User $user): bool;
    public function isNotOwnedBy(User $user): bool;
}
