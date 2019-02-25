<?php

namespace Tests\Feature;

use LiftTracker\Domain\Workouts\Programs\WorkoutProgram;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgramCollection;
use LiftTracker\Http\Controllers\WorkoutProgramController;
use LiftTracker\User;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class WorkoutProgramFeatureTest extends TestCase
{
    /**
     * @return void
     */
    public function testIndexWithoutAnyWorkouts(): void
    {
        $user = factory(User::class)->create();

        $this->actingAs($user)
            ->get(WorkoutProgramController::ROUTE)
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
            ->get(WorkoutProgramController::ROUTE)
            ->assertStatus(200)
            ->assertDontSeeText('You do not have any workout programs')
            ->assertSeeTextInOrder([$first->name, $second->name, $third->name])
            ->assertSeeText('Add another program');
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
            ->post(route('workout-programs.update', $otherUsersProgram->id), ['name' => 'BBB'])
            ->assertStatus(404);
    }

}
