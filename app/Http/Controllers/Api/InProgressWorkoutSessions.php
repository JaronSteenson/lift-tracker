<?php

namespace LiftTracker\Http\Controllers\Api;

use Illuminate\Support\Collection;
use LiftTracker\Domain\Workouts\Sessions\WorkoutSession;
use LiftTracker\Http\Controllers\Controller;
use LiftTracker\User;

class InProgressWorkoutSessions extends Controller
{
    /**
     * @return Collection
     */
    public function __invoke(): Collection
    {
        /** @var User $user */
        $user = auth()->user();

        return (new WorkoutSession)->findInProgress($user->id);
    }
}
