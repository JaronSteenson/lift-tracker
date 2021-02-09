<?php

namespace Tests\Unit\Domain\Workouts\Programs;

use LiftTracker\Domain\Workouts\Programs\WorkoutProgram;
use LiftTracker\User;
use PHPUnit\Framework\Constraint\Constraint;
use Tests\TestCase;

class WorkoutProgramTest extends TestCase
{

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

        $isOwnedBy = $workoutProgram->userOwnsThis($otherUser);

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

}
