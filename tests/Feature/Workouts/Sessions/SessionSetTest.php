<?php

namespace Tests\Feature\Workouts\Sessions;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use LiftTracker\Http\Middleware\VerifyCsrfToken;
use LiftTracker\User;
use Tests\Helpers\WorkoutSessionFactory;
use Tests\TestCase;

class SessionSetTest extends TestCase
{
    use DatabaseTransactions;

    public function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware();
    }

    public function testUpdate(): void
    {
        $user = factory(User::class)->create();
        [$routineExercise, , $sessionSet] = (new WorkoutSessionFactory())->createSessionSetsWithParents($user, 1);

        $uri = route('sessions-sets.store') . '/' . $sessionSet->uuid;

        $data = [
            'restPeriodDuration' => 90,
            'weight' => 200,
            'reps' => 20,
        ];

        $routineExercise->weight = null;
        $routineExercise->save();

        $this->actingAs($user)
            ->putJson($uri, $data)
            ->assertStatus(200)
            ->assertJson([
                'endedAt' => null,
                'position' => 0,
                'reps' => 20,
                'restPeriodDuration' => 90,
                'restPeriodEndedAt' => null,
                'restPeriodStartedAt' => null,
                'startedAt' => null,
                'uuid' => $sessionSet->uuid,
                'weight' => 200,
            ]);

        self::assertEquals(
            200,
            $routineExercise->refresh()->weight,
            'The routine exercise weight should be synced for the updated set weight'
        );
    }

}
