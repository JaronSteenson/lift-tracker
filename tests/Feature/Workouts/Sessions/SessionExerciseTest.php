<?php

namespace Tests\Feature\Workouts\Sessions;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use LiftTracker\Http\Middleware\VerifyCsrfToken;
use LiftTracker\User;
use Tests\Helpers\WorkoutSessionFactory;
use Tests\TestCase;

class SessionExerciseTest extends TestCase
{
    use DatabaseTransactions;

    public function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware();
    }

    public function testExerciseAndSetsAreUpdated(): void
    {
        $user = factory(User::class)->create();

        [
            $routineExercise,
            $sessionExercise,
            $sessionSet1,
            $sessionSet2,
        ] = (new WorkoutSessionFactory())->createSessionSetsWithParents($user, 2);

        $uri = route('sessions-exercises.store') . '/' . $sessionExercise->uuid;

        $data = [
            'notes' => 'Pretty much cardio at this weight!',
            'sessionSets' => [
                [
                    'uuid' => $sessionSet1->uuid,
                    'weight' => 10,
                    'reps' => 20,
                ],
                [
                    'uuid' => $sessionSet2->uuid,
                    'weight' => 20,
                    'reps' => 40,
                ],
            ],
        ];

        $this->actingAs($user)
            ->putJson($uri, $data)
            ->assertStatus(200)
            ->assertJson([
                'uuid' => $sessionExercise->uuid,
                'notes' => 'Pretty much cardio at this weight!',
                'sessionSets' => [
                    [
                        'uuid' => $sessionSet1->uuid,
                        'weight' => 10,
                        'reps' => 20,
                    ],
                    [
                        'uuid' => $sessionSet2->uuid,
                        'weight' => 20,
                        'reps' => 40,
                    ],
                ],
            ]);

        self::assertEquals(20,
            $routineExercise->refresh()->weight,
            'The weight of the last set should have been synced back to the routine exercise'
        );
    }

}
