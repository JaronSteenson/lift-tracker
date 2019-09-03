<?php


namespace LiftTracker\Domain\Users;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use LiftTracker\User;

trait CanBeOwnedByUserTrait
{

    /**
     * Does this user own the workout program, own means they created it.
     * @param User $user
     * @return bool
     */
    public function userOwnsThis(User $user): bool
    {
        /** @noinspection PhpUndefinedFieldInspection */
        return $this->userId === $user->id;
    }

    /**
     * Get the user that owns the workout program, null if it is a community owned.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'userId');
    }

}
