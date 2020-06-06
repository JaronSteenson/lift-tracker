<?php

namespace LiftTracker\Http\Controllers\Api;

use LiftTracker\Domain\Workouts\Sessions\SessionExercise;
use LiftTracker\Http\Controllers\Controller;
use LiftTracker\User;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class LastTimeSessionExercise extends Controller
{
    /**
     * Show the profile for the given user.
     *
     * @param string $sessionExerciseUuid
     * @return SessionExercise
     */
    public function __invoke(string $sessionExerciseUuid): ?SessionExercise
    {
        $sessionExercise = (new SessionExercise)->findByUuid($sessionExerciseUuid);

        /** @var User $user */
        $user = auth()->user();

        if ($sessionExercise === null || $sessionExercise->isNotOwnedBy($user)) {
            throw new NotFoundHttpException('Session exercise not found');
        }

        $lastTime =  $sessionExercise->findLastTime();

        if ($lastTime === null) {
            return null;
        }

        return $lastTime;
    }
}
