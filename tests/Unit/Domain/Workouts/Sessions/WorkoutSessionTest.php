<?php

namespace Tests\Unit\Domain\Workouts\Sessions;

use Carbon\Carbon;
use LiftTracker\Domain\Workouts\Sessions\SessionExercise;
use LiftTracker\Domain\Workouts\Sessions\SessionSet;
use LiftTracker\Domain\Workouts\Sessions\WorkoutSession;
use LiftTracker\User;
use Tests\TestCase;

class WorkoutSessionTest extends TestCase
{

    public function testDeleteWithChildren(): void
    {
        /** @var User $user */
        $user = factory(User::class)->create();

        $session = new WorkoutSession();
        $session->name = 'Body weight Wednesday';
        $session->userId = $user->id;
        $session->startedAt = Carbon::yesterday()->subtract('1 day');
        $session->save();

        $exercise = new SessionExercise();
        $exercise->routineExerciseId = 1; // Not actually linked by foreign key.
        $exercise->name = 'Pushups time before last'; // Doesn't effect the link.
        $exercise->workoutSessionId = $session->id;
        $exercise->position = 1;
        $exercise->save();

        $set = new SessionSet();
        $set->sessionExerciseId = $exercise->id;
        $set->position = 1;
        $set->save();

        $session->refresh();
        /** @var SessionExercise $exercise */
        $exercise = $session->sessionExercises()->first();
        $sessionSets = $exercise->sessionSets;
        /** @var SessionSet $sessionSet */
        $sessionSet = $exercise->sessionSets->first();

        self::assertNotNull($session->find($session->id));
        self::assertNotNull($exercise->find($exercise->id));
        self::assertNotNull($sessionSet->find($sessionSet->id));

        $session->deleteWithChildren();

        self::assertNull($session->find($session->id));
        self::assertNull($exercise->find($exercise->id));
        self::assertNull($sessionSet->find($sessionSet->id));
    }

}
