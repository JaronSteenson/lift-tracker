<?php

namespace Tests\Feature;

use Carbon\Carbon;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Str;
use LiftTracker\Domain\Workouts\Programs\RoutineExercise;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgram;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgramRoutine;
use LiftTracker\Http\Middleware\VerifyCsrfToken;
use LiftTracker\User;
use Tests\TestCase;

class WorkoutProgramFeatureTest extends TestCase
{
    use DatabaseTransactions;

    public function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware([VerifyCsrfToken::class]);
    }

    /**
     * @return void
     */
    public function testIndexWithoutAnyWorkouts(): void
    {
        $user = factory(User::class)->create();

        $this->actingAs($user)
            ->get(route('workout-programs.index'))
            ->assertStatus(200)
            ->assertExactJson([]);
    }

    /**
     * @return void
     */
    public function testIndexWithSomeWorkouts(): void
    {
        $user = factory(User::class)->create();

        /** @var WorkoutProgram $first */
        $first = factory(WorkoutProgram::class)->create(['name' => 'AAA', 'userId' => $user->id, 'createdAt' => Carbon::yesterday()]);

        /** @var WorkoutProgram $second */
        $third = factory(WorkoutProgram::class)->create(['name' => 'BBB', 'userId' => $user->id, 'createdAt' => Carbon::today()]);

        /** @var WorkoutProgram $third */
        $second = factory(WorkoutProgram::class)->create(['name' => 'BBB', 'userId' => $user->id, 'createdAt' => Carbon::tomorrow()]);

        $this->actingAs($user)
            ->get(route('workout-programs.index'))
            ->assertStatus(200)
            ->assertJson([
                $first->toArray(),
                $second->toArray(),
                $third->toArray(),
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
                ]
            ]
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
                    'exercises' => [
                        [
                            'name' => 'Push ups',
                            'numberOfSets' => 100,
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

    /**
     * @return void
     */
    public function testUsersCanUpdateTheirOwnPrograms(): void
    {
        $user = factory(User::class)->create();

        $usersProgram = new WorkoutProgram([
            'name' => 'Program 1',
        ]);

        $usersProgram->user()->associate($user);
        $usersProgram->save();

        $this->actingAs($user)
            ->put(route('workout-programs.update', $usersProgram->id), $usersProgram->toArray())
            ->assertStatus(200)
            ->assertJson($usersProgram->toArray());
    }

    /**
     * @return void
     */
    public function testUsersCannotUpdateOtherUsersPrograms(): void
    {
        $user = factory(User::class)->create();
        $otherUser = factory(User::class)->create();

        $otherUsersProgram = new WorkoutProgram(['name' => 'AAA']);
        $otherUsersProgram->user()->associate($otherUser);
        $otherUsersProgram->save();

        $this->actingAs($user)
            ->put(route('workout-programs.update', $otherUsersProgram->id), $otherUsersProgram->toArray())
            ->assertStatus(403);
    }

    /**
     * @return void
     */
    public function testUsersCanDeleteTheirOwnPrograms(): void
    {
        $user = factory(User::class)->create();

        $usersProgram = new WorkoutProgram(['name' => 'Program 1']);
        $usersProgram->user()->associate($user);
        $usersProgram->save();

        $this->actingAs($user)
            ->delete(route('workout-programs.destroy', $usersProgram->id))
            ->assertStatus(200);
    }

    /**
     * @return void
     */
    public function testUsersCannotDeleteOtherUsersPrograms(): void
    {
        $user = factory(User::class)->create();
        $otherUser = factory(User::class)->create();

        $otherUsersProgram = new WorkoutProgram(['name' => 'AAA']);
        $otherUsersProgram->user()->associate($otherUser);
        $otherUsersProgram->save();

        $this->actingAs($user)
            ->delete(route('workout-programs.destroy', $otherUsersProgram->id))
            ->assertStatus(403);
    }

}
