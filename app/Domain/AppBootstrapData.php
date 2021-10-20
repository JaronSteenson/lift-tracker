<?php

namespace LiftTracker\Domain;

use Illuminate\Support\Facades\Auth;
use LiftTracker\Domain\Workouts\Sessions\WorkoutSession;
use LiftTracker\User;

class AppBootstrapData implements \JsonSerializable
{

    /**
     * @inheritDoc
     */
    public function jsonSerialize(): array
    {
        /** @var User $authenticatedUser */
        $authenticatedUser = Auth::user();

        $appData = [
            'authenticatedUser' => $authenticatedUser,
            'appName' => config('app.name'),
            'csrfToken' => csrf_token(),
            'facebookAppId' => config('app.facebook_app_id'),
            'sessionLifetime' => config('session.lifetime'),
        ];

        $baseData = ['app' => $appData];

        if ($authenticatedUser) {
            return array_merge($baseData, $this->loadAuthenticatedUserData($authenticatedUser));
        }

        return $baseData;
    }

    private function loadAuthenticatedUserData(User $user): array
    {
        $myWorkoutSessions = $user->getWorkoutSessionsPaginated(1);

        return [
            'workoutSession' => [
                'inProgressWorkouts' => (new WorkoutSession)->findInProgress($user->id),
                'myWorkoutSessions' => $myWorkoutSessions,
                'myWorkoutSessionsPagesLoaded' => 1,
                'myWorkoutSessionsPagesAllLoaded' => count($myWorkoutSessions) < (new WorkoutSession)->getPerPage(),
            ],
            'programBuilder' => [
                'myWorkoutPrograms' => $user->getWorkoutPrograms(),
            ],
        ];
    }
}
