<?php

namespace Tests\Unit\Domain\Workouts\Sessions;

use LiftTracker\Domain\Workouts\Programs\RoutineExercise;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgram;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgramRoutine;
use LiftTracker\Domain\Workouts\Sessions\WorkoutSession;
use RuntimeException;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use LiftTracker\Domain\Workouts\Sessions\SessionExercise;
use LiftTracker\Domain\Workouts\Sessions\SessionSet;
use Tests\Helpers\WorkoutSessionFactory;
use Tests\TestCase;

class SessionSetTest extends TestCase
{
    use DatabaseTransactions;

    public function testSyncWeightToRoutine(): void
    {
        [$routineExercise, , $sessionSet] = (new WorkoutSessionFactory())->createSessionSetsWithParents();

        $sessionSet->syncWeightToRoutine();
        self::assertNull($routineExercise->refresh()->weight);

        $sessionSet->weight = 100;
        $sessionSet->syncWeightToRoutine();
        self::assertEquals(100, $routineExercise->refresh()->weight);
    }

    public function testSyncWeightToRoutineNoSessionExercise(): void
    {
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Session set did not have a parent Session exercise');

        $sessionSet = new SessionSet();
        $sessionSet->syncWeightToRoutine();
    }

    public function testSyncWeightToRoutineNoRoutine(): void
    {
        $this->expectNotToPerformAssertions();

        $sessionExercise = new SessionExercise();

        $sessionSet = new SessionSet();
        $sessionSet->sessionExercise = $sessionExercise;
        $sessionSet->syncWeightToRoutine();
    }

}
