<?php

namespace Tests\Feature\Workouts\Sessions;

use Carbon\Carbon;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use LiftTracker\Domain\Workouts\Sessions\SessionExercise;
use LiftTracker\Domain\Workouts\Sessions\WorkoutSession;
use LiftTracker\Http\Controllers\Api\SessionExercisePreviousEntries;
use LiftTracker\Http\Middleware\Authenticate;
use LiftTracker\Http\Middleware\VerifyCsrfToken;
use LiftTracker\User;
use Tests\TestCase;

class SessionExercisePreviousEntriesTest extends TestCase
{
    use DatabaseTransactions;

    public function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware();
    }

    public function testOriginSessionExerciseDoesntExist(): void
    {
        $user = factory(User::class)->create();

        /**
         * @see SessionExercisePreviousEntries
         */
        $this->actingAs($user)
            ->call('GET', 'api/session-exercise-previous-entries/fake-uuid')
            ->assertStatus(404);
    }

    public function testOriginSessionExerciseIsNotOwnedByUser(): void
    {
        $user = factory(User::class)->create();

        $workoutSession = new WorkoutSession;
        $workoutSession->name = 'Body weight Wednesday';
        $workoutSession->save();

        $sessionExercise = new SessionExercise;
        $sessionExercise->name = 'Pushups';
        $sessionExercise->workoutSessionId = $workoutSession->id;
        $sessionExercise->position = 1;
        $sessionExercise->save();

        /**
         * @see SessionExercisePreviousEntries
         */
        $this->actingAs($user)
            ->call('GET', 'api/session-exercise-previous-entries/' . $sessionExercise->uuid)
            ->assertStatus(404);
    }

    public function testOriginSessionExerciseHasNoPreviousEntry(): void
    {
        /** @var User $user */
        $user = factory(User::class)->create();

        $workoutSession = new WorkoutSession;
        $workoutSession->name = 'Body weight Wednesday';
        $workoutSession->userId = $user->id;
        $workoutSession->save();

        $sessionExercise = new SessionExercise;
        $sessionExercise->name = 'Pushups';
        $sessionExercise->workoutSessionId = $workoutSession->id;
        $sessionExercise->position = 1;
        $sessionExercise->save();

        /**
         * @see SessionExercisePreviousEntries
         */
        $this->actingAs($user)
            ->call('GET', 'api/session-exercise-previous-entries/' . $sessionExercise->uuid)
            ->assertStatus(200)
            ->assertJson([]);
    }

    public function testOriginSessionExerciseHasPreviousEntries(): void
    {
        /** @var User $user */
        $user = factory(User::class)->create();

        $previousWorkoutSession = new WorkoutSession;
        $previousWorkoutSession->name = 'Body weight Wednesday';
        $previousWorkoutSession->userId = $user->id;
        $previousWorkoutSession->startedAt = Carbon::yesterday();
        $previousWorkoutSession->save();

        $previousSessionExercise = new SessionExercise;
        $previousSessionExercise->routineExerciseId = 1; // Not actually linked by foreign key.
        $previousSessionExercise->name = 'Pushups last time'; // Doesn't effect the link.
        $previousSessionExercise->workoutSessionId = $previousWorkoutSession->id;
        $previousSessionExercise->position = 1;
        $previousSessionExercise->save();


        $workoutSession = new WorkoutSession;
        $workoutSession->name = 'Body weight Wednesday';
        $workoutSession->userId = $user->id;
        $workoutSession->save();

        $sessionExercise = new SessionExercise;
        $sessionExercise->routineExerciseId = 1; // Not actually linked by foreign key.
        $sessionExercise->name = 'Pushups';
        $sessionExercise->workoutSessionId = $workoutSession->id;
        $sessionExercise->position = 1;
        $sessionExercise->save();

        /**
         * @see SessionExercisePreviousEntries
         */
        $this->actingAs($user)
            ->call('GET', 'api/session-exercise-previous-entries/' . $sessionExercise->uuid)
            ->assertStatus(200)
            ->assertJson([$previousSessionExercise->toArray()]);
    }

    public function testOriginSessionExerciseHasMultiplePreviousEntries(): void
    {
        /** @var User $user */
        $user = factory(User::class)->create();

        $timeBeforeLastWorkoutSession = new WorkoutSession;
        $timeBeforeLastWorkoutSession->name = 'Body weight Wednesday';
        $timeBeforeLastWorkoutSession->userId = $user->id;
        $timeBeforeLastWorkoutSession->startedAt = Carbon::yesterday()->subtract('1 day');
        $timeBeforeLastWorkoutSession->save();

        $timeBeforeLastSessionExercise = new SessionExercise;
        $timeBeforeLastSessionExercise->routineExerciseId = 1; // Not actually linked by foreign key.
        $timeBeforeLastSessionExercise->name = 'Pushups time before last'; // Doesn't effect the link.
        $timeBeforeLastSessionExercise->workoutSessionId = $timeBeforeLastWorkoutSession->id;
        $timeBeforeLastSessionExercise->position = 1;
        $timeBeforeLastSessionExercise->save();

        $previousWorkoutSession = new WorkoutSession;
        $previousWorkoutSession->name = 'Body weight Wednesday';
        $previousWorkoutSession->userId = $user->id;
        $previousWorkoutSession->startedAt = Carbon::yesterday();
        $previousWorkoutSession->save();

        $previousSessionExercise = new SessionExercise;
        $previousSessionExercise->routineExerciseId = 1; // Not actually linked by foreign key.
        $previousSessionExercise->name = 'Pushups last time'; // Doesn't effect the link.
        $previousSessionExercise->workoutSessionId = $previousWorkoutSession->id;
        $previousSessionExercise->position = 1;
        $previousSessionExercise->save();


        $workoutSession = new WorkoutSession;
        $workoutSession->name = 'Body weight Wednesday';
        $workoutSession->userId = $user->id;
        $workoutSession->save();

        $sessionExercise = new SessionExercise;
        $sessionExercise->routineExerciseId = 1; // Not actually linked by foreign key.
        $sessionExercise->name = 'Pushups';
        $sessionExercise->workoutSessionId = $workoutSession->id;
        $sessionExercise->position = 1;
        $sessionExercise->save();

        /**
         * @see SessionExercisePreviousEntries
         */
        $this->actingAs($user)
            ->call('GET', 'api/session-exercise-previous-entries/' . $sessionExercise->uuid)
            ->assertStatus(200)
            ->assertJson([$timeBeforeLastSessionExercise->toArray(), $previousSessionExercise->toArray()]);
    }

}
