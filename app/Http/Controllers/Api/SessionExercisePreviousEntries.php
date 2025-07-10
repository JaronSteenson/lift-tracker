<?php

namespace LiftTracker\Http\Controllers\Api;

use Illuminate\Support\Collection;
use LiftTracker\Domain\Workouts\Sessions\SessionExercise;
use LiftTracker\Http\Controllers\Controller;
use LiftTracker\User;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class SessionExerciseHistory extends Controller
{
    /**
     * Return all previous entries of the given session exercise.
     *
     * @param string $sessionExerciseUuid
     * @return Collection
     */
    public function __invoke(string $sessionExerciseUuid): Collection
    {
        $sessionExercise = (new SessionExercise())->findByUuid($sessionExerciseUuid);

        /** @var User $user */
        $user = auth()->user();

        if ($sessionExercise === null || $sessionExercise->isNotOwnedBy($user)) {
            throw new NotFoundHttpException('Session exercise not found');
        }

        return $sessionExercise->findPreviousEntries();
    }
}
