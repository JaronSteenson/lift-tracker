<?php


namespace LiftTracker\Domain\Users;

use LiftTracker\User;

trait DefaultUserOwnershipCheck
{

    /**
     * Does this user own the workout program, own means they created it.
     * @param User $user
     * @return bool
     */
    public function userOwnsThis(User $user): bool
    {
        return $this->user_id === $user->id;
    }

}