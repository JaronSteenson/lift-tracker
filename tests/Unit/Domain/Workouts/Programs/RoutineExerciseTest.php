<?php

namespace Tests\Unit\Domain\Workouts\Programs;

use Illuminate\Database\QueryException;
use Exception;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use LiftTracker\Domain\Workouts\Programs\RoutineExercise;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgram;
use LiftTracker\Http\Middleware\VerifyCsrfToken;
use LiftTracker\User;
use PHPUnit\Framework\Constraint\Constraint;
use Tests\TestCase;

class RoutineExerciseTest extends TestCase
{
    use DatabaseTransactions;

    public function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware([VerifyCsrfToken::class]);
    }

    /**
     * @param int $attachedUserId
     * @param int|null $otherUserId
     * @param Constraint $assertion
     * @dataProvider isOwnedByProvider
     */
    public function testIsOwnedBy(int $attachedUserId, ?int $otherUserId, Constraint $assertion): void
    {
        $workoutProgram = new WorkoutProgram();
        $workoutProgram->userId = $attachedUserId;

        $otherUser = new User();
        $otherUser->id  = $otherUserId;

        $isOwnedBy = $workoutProgram->isOwnedBy($otherUser);

        static::assertThat($isOwnedBy, $assertion);
    }

    public function isOwnedByProvider(): array
    {
        return [
            'Attached id is the same as other user id' => [123, 123, static::isTrue()],
            'Attached id differs from the other user id' => [123, 321, static::isFalse()],
            'The other user id is not set' => [123, null, static::isFalse()],
        ];
    }

    /**
     * @throws Exception
     */
    public function testMultipleRoutineExercisesSameUuidCannotBeSaved(): void
    {
        $exerciseOne = new RoutineExercise([
            'name' => 'exercise one',
            'numberOfSets' => 0,
            'position' => 0,
        ]);

        $exerciseOne->uuid = '123e4567-e89b-12d3-a456-426655440000';
        $exerciseOne->workoutProgramRoutineId = null;
        $exerciseOne->save();

        $exerciseTwo = new RoutineExercise([
            'name' => 'exercise two',
            'numberOfSets' => 0,
            'position' => 1,
        ]);
        $exerciseTwo->uuid = $exerciseOne->uuid;
        $exerciseTwo->workoutProgramRoutineId = null;

        $this->expectException(QueryException::class);
        $exerciseTwo->save();
    }

}
