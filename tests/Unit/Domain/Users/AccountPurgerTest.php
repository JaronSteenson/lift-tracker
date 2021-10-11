<?php

namespace Tests\Unit\Domain\Users;

use Carbon\Carbon;
use LiftTracker\Domain\Users\AccountPurger;
use LiftTracker\Domain\Workouts\Programs\RoutineExercise;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgram;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgramRoutine;
use LiftTracker\Domain\Workouts\Sessions\SessionExercise;
use LiftTracker\Domain\Workouts\Sessions\SessionSet;
use LiftTracker\Domain\Workouts\Sessions\WorkoutSession;
use LiftTracker\User;
use Tests\TestCase;

class AccountPurgerTest extends TestCase
{

    public function testPurge(): void
    {
        /** @var User $user */
        $user = factory(User::class)->create();

        $workoutProgram = new WorkoutProgram();
        $workoutProgram->name = 'PPL';
        $workoutProgram->userId = $user->id;
        $workoutProgram->save();

        $routine = new WorkoutProgramRoutine();
        $routine->name = 'Push';
        $routine->position = 0;
        $routine->workoutProgramId = $workoutProgram->id;
        $routine->save();

        $routineExercise = new RoutineExercise();
        $routineExercise->name = 'BB bench';
        $routineExercise->workoutProgramRoutineId = $routine->id;
        $routineExercise->position = 0;
        $routineExercise->weight = 50;
        $routineExercise->save();

        $session = new WorkoutSession();
        $session->name = 'Body weight Wednesday';
        $session->userId = $user->id;
        $session->startedAt = Carbon::yesterday()->subtract('1 day');
        $session->save();

        $sessionExercise = new SessionExercise();
        $sessionExercise->routineExerciseId = 1;
        $sessionExercise->name = 'Push ups';
        $sessionExercise->workoutSessionId = $session->id;
        $sessionExercise->position = 1;
        $sessionExercise->save();

        $sessionSet = new SessionSet();
        $sessionSet->sessionExerciseId = $sessionExercise->id;
        $sessionSet->position = 1;
        $sessionSet->save();

        self::assertNotNull($user->fresh());
        self::assertNotNull($workoutProgram->fresh());
        self::assertNotNull($routine->fresh());
        self::assertNotNull($routineExercise->fresh());
        self::assertNotNull($session->fresh());
        self::assertNotNull($sessionExercise->fresh());
        self::assertNotNull($sessionSet->fresh());

        (new AccountPurger())->purge($user);

        self::assertNull($user->fresh());
        self::assertNull($workoutProgram->fresh());
        self::assertNull($routine->fresh());
        self::assertNull($routineExercise->fresh());
        self::assertNull($session->fresh());
        self::assertNull($sessionExercise->fresh());
        self::assertNull($sessionSet->fresh());
    }

    public function testPurgeWithEmptyAccount(): void
    {
        /** @var User $user */
        $user = factory(User::class)->create();

        self::assertNotNull($user->fresh());

        (new AccountPurger())->purge($user);

        self::assertNull($user->fresh());
    }

}
