<?php

namespace Tests\Feature\Workouts\Programs;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Str;
use LiftTracker\Domain\Workouts\Programs\RoutineExercise;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgram;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgramRoutine;
use LiftTracker\Domain\Workouts\Sessions\WorkoutSession;
use LiftTracker\Http\Middleware\VerifyCsrfToken;
use LiftTracker\User;
use Tests\TestCase;

class WorkoutRoutineFeatureTest extends TestCase
{
    use DatabaseTransactions;

    public function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware();
    }

    public function testIndexWithoutAnyRoutines(): void
    {
        $user = factory(User::class)->create();

        $this->actingAs($user)
            ->get(route('workout-routines.index'))
            ->assertStatus(200)
            ->assertExactJson([]);
    }

    public function testIndexWithSomeWorkouts(): void
    {
        $user = factory(User::class)->create();

        /** @var WorkoutProgram $workout_program */
        $workout_program = factory(WorkoutProgram::class)->create([
            'name' => 'Workout program', 'userId' => $user->id, 'createdAt' => Carbon::yesterday()
        ]);

        /** @var WorkoutProgramRoutine $most_recent_used */
        $most_recent_used = factory(WorkoutProgramRoutine::class)->create([
            'workoutProgramId' => $workout_program->id, 'position' => 0, 'name' => 'most recent used', 'updatedAt' => Carbon::yesterday(),
        ]);
        /** @var WorkoutSession $most_recent_used */
        $most_recent_used_session = factory(WorkoutSession::class)->create([
            'workoutProgramRoutineId' => $most_recent_used->id, 'userId' => $user->id,  'name' => 'most recent used', 'startedAt' => Carbon::today(),
        ]);
        $most_recent_used->latestSession = $most_recent_used_session->toArray();

        /** @var WorkoutProgramRoutine $second_most_recent_used */
        $second_most_recent_used = factory(WorkoutProgramRoutine::class)->create([
            'workoutProgramId' => $workout_program->id, 'position' => 1, 'name' => 'second most recent used', 'updatedAt' => Carbon::today()
        ]);
        /** @var WorkoutSession $most_recent_used */
        $second_most_recent_used_session = factory(WorkoutSession::class)->create([
            'workoutProgramRoutineId' => $second_most_recent_used->id, 'userId' => $user->id,  'name' => 'second most recent used', 'startedAt' => Carbon::yesterday(),
        ]);
        $second_most_recent_used->latestSession = $second_most_recent_used_session->toArray();

        /** @var WorkoutProgramRoutine $unused_latest_edited */
        $unused_latest_edited = factory(WorkoutProgramRoutine::class)->create([
            'workoutProgramId' => $workout_program->id, 'position' => 2, 'name' => 'unused latest edited', 'updatedAt' => Carbon::today()
        ]);

        /** @var WorkoutProgramRoutine $unused_second_latest_edited */
        $unused_second_latest_edited = factory(WorkoutProgramRoutine::class)->create([
            'workoutProgramId' => $workout_program->id, 'position' => 3, 'name' => 'unused second latest edited', 'updatedAt' => Carbon::yesterday()
        ]);

        $this->actingAs($user)
            ->get(route('workout-routines.index'))
            ->assertStatus(200)
            ->assertJson([
                $most_recent_used->toArray(),
                $second_most_recent_used->toArray(),
                $unused_latest_edited->toArray(),
                $unused_second_latest_edited->toArray(),
            ]);
    }

    public function testUserCanSaveNewProgramWithoutRoutines(): void
    {
        $data = [
            'name' => 'Program 1',
        ];

        /** @var User $user */
        $user = factory(User::class)->create();

        $this->actingAs($user)
            ->post(route('workout-programs.store'), $data)
            ->assertStatus(201)
            ->assertJson(['name' => 'Program 1']);

        $savedProgram = $user->findWorkoutPrograms()->first();

        static::assertThat($savedProgram->name, static::equalTo($data['name']));
    }

    public function testUserCanSaveNewProgramWithARoutine(): void
    {
        $data = [
            'name' => 'Program 1',
            'workoutProgramRoutines' => [
                [
                    'name' => 'Day one',
                    'normalDay' => 'Saturday',
                    'position' => 0,
                ]
            ],
        ];

        /** @var User $user */
        $user = factory(User::class)->create();

        $this->actingAs($user)
            ->post(route('workout-programs.store'), $data)
            ->assertStatus(201)
            ->assertJson($data);

        /** @var WorkoutProgram $savedProgram */
        $savedProgram = $user->findWorkoutPrograms()->first();

        static::assertThat($savedProgram->name, static::equalTo($data['name']));

        /** @var WorkoutProgramRoutine $routine */
        $routine = $savedProgram->workoutProgramRoutines->first();

        static::assertThat($routine->name, static::equalTo('Day one'));
        static::assertTrue($routine->routineExercises->isEmpty());
    }

    public function testUserCanSaveNewProgramWithARoutineAndExercise(): void
    {
        $data = [
            'name' => 'Program 1',
            'workoutProgramRoutines' => [
                [
                    'name' => 'Day one',
                    'normalDay' => 'Monday',
                    'position' => 0,
                    'routineExercises' => [
                        [
                            'name' => 'Push ups',
                            'numberOfSets' => 100,
                            'position' => 0,
                        ]
                    ]
                ]
            ]
        ];

        /** @var User $user */
        $user = factory(User::class)->create();

        $request = $this->actingAs($user)
            ->post(route('workout-programs.store'), $data)
            ->assertStatus(201);

        /** @var WorkoutProgram $savedProgram */
        $savedProgram = $user->findWorkoutPrograms()->first();

        $request->assertJson($savedProgram->toArray());

        static::assertThat($savedProgram->name, static::equalTo($data['name']));

        /** @var WorkoutProgramRoutine $routine */
        $routine = $savedProgram->workoutProgramRoutines->first();

        static::assertThat($routine->name, static::equalTo('Day one'));
        static::assertFalse($routine->routineExercises->isEmpty());

        /** @var RoutineExercise $exercise */
        $exercise = $routine->routineExercises->first();
        static::assertThat($exercise->name, static::equalTo('Push ups'));
        static::assertThat($exercise->numberOfSets, static::equalTo(100));
    }

    public function testExercisesCanBeSwappedInAndOut(): void
    {
        $data = [
            'name' => 'Program 1',
            'workoutProgramRoutines' => [
                [
                    'name' => 'Day one',
                    'normalDay' => 'Monday',
                    'position' => 0,
                    'routineExercises' => [
                        [
                            'name' => 'Push ups',
                            'numberOfSets' => 100,
                            'position' => 0,
                        ]
                    ]
                ]
            ]
        ];

        /** @var User $user */
        $user = factory(User::class)->create();

        $request = $this->actingAs($user)
            ->post(route('workout-programs.store'), $data)
            ->assertStatus(201);

        /** @var WorkoutProgram $savedProgram */
        $savedProgram = $user->findWorkoutPrograms()->first();

        $request->assertJson($savedProgram->toArray());

        $savedExercise = $savedProgram->workoutProgramRoutines->first()
            ->routineExercises()->first();

        static::assertThat($savedExercise->name, static::equalTo('Push ups'));
        static::assertThat($savedExercise->numberOfSets, static::equalTo(100));

        // Now swap out the push ups with sit ups.

        $savedProgram->workoutProgramRoutines->first()
            ->setRoutineExercises(new Collection([new RoutineExercise([
                'name' => 'Sit ups',
                'numberOfSets' => 50,
                'position' => 2,
            ])]));

        $exerciseSwapRequest = $this->actingAs($user)
            ->put(route('workout-programs.update', $savedProgram->uuid), $savedProgram->toArray())
            ->assertStatus(200);

        /** @var WorkoutProgram $withSwappedExercises */
        $withSwappedExercises = $user->findWorkoutPrograms()->first();

        $exerciseSwapRequest->assertJson($withSwappedExercises->toArray());

        /** @var RoutineExercise $exercise */
        $swappedExercise = $withSwappedExercises->workoutProgramRoutines->first()
            ->routineExercises()->first();

        static::assertThat($swappedExercise->name, static::equalTo('Sit ups'));
        static::assertThat($swappedExercise->numberOfSets, static::equalTo(50));
    }

    public function testExercisesCanMoveBetweenWorkouts(): void
    {
        $data = [
            'name' => 'Program 1',
            'workoutProgramRoutines' => [
                [
                    'name' => 'Day one',
                    'normalDay' => 'Monday',
                    'position' => 0,
                    'routineExercises' => [
                        [
                            'name' => 'Push ups',
                            'numberOfSets' => 100,
                            'position' => 0,
                        ]
                    ]
                ],
                [
                    'name' => 'Day two',
                    'normalDay' => 'Tuesday',
                    'position' => 1,
                    'routineExercises' => [
                        [
                            'name' => 'Sit ups',
                            'numberOfSets' => 100,
                            'position' => 0,
                        ]
                    ]
                ]
            ]
        ];

        /** @var User $user */
        $user = factory(User::class)->create();

        $request = $this->actingAs($user)
            ->post(route('workout-programs.store'), $data)
            ->assertStatus(201);

        /** @var WorkoutProgram $savedProgram */
        $savedProgram = $user->findWorkoutPrograms()->first();

        $request->assertJson($savedProgram->toArray());

        // Remove pushups.
        /** @var RoutineExercise $pushups */
        $pushups = $savedProgram->workoutProgramRoutines[0]->routineExercises->pop();
        $pushups->position = 1;

        static::assertThat($pushups->name, static::equalTo('Push ups'));
        static::assertThat($pushups->numberOfSets, static::equalTo(100));

        // Move them to the second workout.
        $savedProgram->workoutProgramRoutines[1]->routineExercises->push($pushups);

        $exerciseSwapRequest = $this->actingAs($user)
            ->put(route('workout-programs.update', $savedProgram->uuid), $savedProgram->toArray())
            ->assertStatus(200);

        /** @var WorkoutProgram $withPushupsMovedWorkouts */
        $withPushupsMovedWorkouts = $user->findWorkoutPrograms()->first();

        $exerciseSwapRequest->assertJson($withPushupsMovedWorkouts->toArray());


        static::assertEmpty($withPushupsMovedWorkouts->workoutProgramRoutines[0]->routineExercises->toArray());

        $dayTwo = $withPushupsMovedWorkouts->workoutProgramRoutines[1];

        static::assertThat($dayTwo->routineExercises[0]->name, static::equalTo('Sit ups'));
        static::assertThat($dayTwo->routineExercises[1]->name, static::equalTo('Push ups'));
        static::assertThat($dayTwo->routineExercises[1]->uuid, static::equalTo($pushups->uuid));
    }

    public function testWorkoutProgramsCanBeSwappedInAndOut(): void
    {
        $data = [
            'name' => 'Program 1',
            'workoutProgramRoutines' => [
                [
                    'name' => 'Day one',
                    'normalDay' => 'Monday',
                    'position' => 0,
                ]
            ]
        ];

        /** @var User $user */
        $user = factory(User::class)->create();

        $request = $this->actingAs($user)
            ->post(route('workout-programs.store'), $data)
            ->assertStatus(201);

        /** @var WorkoutProgram $savedProgram */
        $savedProgram = $user->findWorkoutPrograms()->first();

        $request->assertJson($savedProgram->toArray());

        // Now swap out and entire day
        $withSwappedRoutine =  $savedProgram->toArray();

        $withSwappedRoutine['workoutProgramRoutines'] = [
            [
                'name' => 'Day A',
                'normalDay' => 'Tuesday',
                'position' => 1,
            ]
        ];

        $this->actingAs($user)
            ->put(route('workout-programs.update', $savedProgram->uuid), $withSwappedRoutine)
            ->assertStatus(200);

        /** @var RoutineExercise $exercise */
        $swappedRoutine = $user->findWorkoutPrograms()->first()
            ->workoutProgramRoutines()->first();

        static::assertThat($swappedRoutine->name, static::equalTo('Day A'));
        static::assertThat($swappedRoutine->normalDay, static::equalTo('Tuesday'));
    }

    public function testUserCannotSaveNewProgramWithANameTooLong(): void
    {
        $data = [
            'name' => Str::random(500),
        ];

        /** @var User $user */
        $user = factory(User::class)->create();

        $this->actingAs($user)
            ->post(route('workout-programs.store'), $data)
            ->assertStatus(302);
    }

    public function testUsersCanUpdateTheirOwnPrograms(): void
    {
        $user = factory(User::class)->create();

        $usersProgram = new WorkoutProgram([
            'name' => 'Program 1',
            'position' => 0,
        ]);

        $usersProgram->user()->associate($user);
        $usersProgram->save();

        $this->actingAs($user)
            ->put(route('workout-programs.update', $usersProgram->uuid), $usersProgram->toArray())
            ->assertStatus(200)
            ->assertJson($usersProgram->toArray());
    }

    public function testUsersCannotUpdateOtherUsersPrograms(): void
    {
        $user = factory(User::class)->create();
        $otherUser = factory(User::class)->create();

        $otherUsersProgram = new WorkoutProgram(['name' => 'AAA']);
        $otherUsersProgram->user()->associate($otherUser);
        $otherUsersProgram->save();

        $this->actingAs($user)
            ->put(route('workout-programs.update', $otherUsersProgram->uuid), $otherUsersProgram->toArray())
            ->assertStatus(403);
    }

    public function testUsersCanDeleteTheirOwnPrograms(): void
    {
        $user = factory(User::class)->create();

        $usersProgram = new WorkoutProgram(['name' => 'Program 1']);
        $usersProgram->user()->associate($user);
        $usersProgram->save();

        $routine = new WorkoutProgramRoutine(['name' => 'Routine 1']);
        $routine->workoutProgramId = $usersProgram->id;
        $routine->position = 0;
        $routine->save();

        $exercise = new RoutineExercise(['name' => 'Push ups']);
        $exercise->workoutProgramRoutineId = $routine->id;
        $exercise->position = 0;
        $exercise->save();

        // model::exists() is looking at all rows for some reason, hence manual re-find.
        self::assertNotNull($usersProgram->find($usersProgram->id));
        self::assertNotNull($routine->find($routine->id));
        self::assertNotNull($exercise->find($exercise->id));

        $this->actingAs($user)
            ->delete(route('workout-programs.destroy', $usersProgram->uuid))
            ->assertStatus(200);

        self::assertNull($usersProgram->find($usersProgram->id), 'The workout program should have been deleted');
        self::assertNull($routine->find($routine->id), 'The child routine should have been deleted');
        self::assertNull($exercise->find($exercise->id), 'The child exercise should have been deleted');
    }

    public function testUsersCannotDeleteOtherUsersPrograms(): void
    {
        $user = factory(User::class)->create();
        $otherUser = factory(User::class)->create();

        $otherUsersProgram = new WorkoutProgram(['name' => 'AAA']);
        $otherUsersProgram->user()->associate($otherUser);
        $otherUsersProgram->save();

        $this->actingAs($user)
            ->delete(route('workout-programs.destroy', $otherUsersProgram->uuid))
            ->assertStatus(403);
    }

}
