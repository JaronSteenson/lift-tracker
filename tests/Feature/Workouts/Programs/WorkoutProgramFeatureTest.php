<?php

namespace Tests\Feature;

use Illuminate\Contracts\Session\Session;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgram;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgramCollection;
use LiftTracker\Http\Controllers\WorkoutProgramController;
use LiftTracker\Http\Middleware\VerifyCsrfToken;
use LiftTracker\User;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

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
            ->assertSeeInOrder(['You do not have any workout programs', 'Add one']);
    }

    /**
     * @return void
     */
    public function testIndexWithSomeWorkouts(): void
    {
        $user = factory(User::class)->create();

        $first = factory(WorkoutProgram::class)->create(['name' => 'AAA', 'user_id' => $user->id]);
        $second = factory(WorkoutProgram::class)->create(['name' => 'BBB', 'user_id' => $user->id]);
        $third = factory(WorkoutProgram::class)->create(['name' => 'CCC', 'user_id' => $user->id]);

        $this->actingAs($user)
            ->get(route('workout-programs.index'))
            ->assertStatus(200)
            ->assertDontSeeText('You do not have any workout programs')
            ->assertSeeTextInOrder([$first->name, $second->name, $third->name])
            ->assertSeeText('Add another program');
    }

    public function testUserCanSaveNewProgram(): void
    {
        $data = [
            '_token' => csrf_token(),
            'name' => 'Program 1',
        ];

        /** @var User $user */
        $user = factory(User::class)->create();

        $this->actingAs($user)
            ->post(route('workout-programs.store'), $data)
            ->assertStatus(302)
            ->assertRedirect(route('workout-programs.index'))
            ->assertSessionHas('success-alert', 'Workout program has been added');

        $savedProgram = $user->findWorkoutPrograms()->first();

        static::assertThat($savedProgram->name, static::equalTo($data['name']));
    }

    /**
     * @return void
     */
    public function testUsersCanUpdateTheirOwnPrograms(): void
    {
        $user = factory(User::class)->create();

        $usersProgram = new WorkoutProgram(['name' => 'Program 1']);
        $usersProgram->user()->associate($user);
        $usersProgram->save();

        $data = [
            '_token' => csrf_token(),
            '_method' => 'PUT',
            'name' => 'Program One',
        ];

        $this->actingAs($user)
            ->post(route('workout-programs.update', $usersProgram), $data)
            ->assertStatus(302)
            ->assertRedirect(route('workout-programs.index'))
            ->assertSessionHas('success-alert', 'Workout program has been updated');
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

        $data = [
            '_token' => csrf_token(),
            '_method' => 'PUT',
            'name' => 'Program 1',
        ];

        $this->actingAs($user)
            ->post(route('workout-programs.update', [$otherUsersProgram]), $data)
            ->assertStatus(404);
    }

}
