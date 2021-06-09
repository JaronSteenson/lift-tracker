<?php

namespace Tests\Feature\Auth;

use Carbon\Carbon;
use Facebook\Facebook;
use Illuminate\Auth\AuthManager;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use LiftTracker\Auth\FacebookAuthManager;
use LiftTracker\Domain\Workouts\Programs\RoutineExercise;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgram;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgramRoutine;
use LiftTracker\Http\Controllers\Auth\FacebookLoginController;
use LiftTracker\Http\Middleware\VerifyCsrfToken;
use LiftTracker\User;
use Tests\TestCase;

class FacebookLoginFeatureTest extends TestCase
{
    use DatabaseTransactions;

    public function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware([VerifyCsrfToken::class]);
    }

    /**
     * @dataProvider loginProvider
     */
    public function testLogin(?string $afterUrl): void
    {
        $this->withoutExceptionHandling();

        $facebookAuthManagerMock = new class extends FacebookAuthManager {
            public function __construct()
            {

            }

            public function registerOrLoginUser(string $shortLivedAccessCode, string $redirectUri): User
            {
                return new User;
            }
        };

        app()->when(FacebookLoginController::class)
            ->needs(FacebookAuthManager::class)
            ->give(function () use ($facebookAuthManagerMock) {
                return $facebookAuthManagerMock;
            });

        $code = 'AQB3WuHrKQ4Mtr8ZLmdHausMBa60fLdADN9z715TK7zPMptNhEYA';
        $state = "csrf-token=3DWAnIbRVXo5qleOuIvVmWJvdX9dFwEes0E1lOC1DR,after-login-url={$afterUrl}";

        $expectedAfterUrlRedirect = $afterUrl ?: URL::to('/');

        $this->call('GET', route('facebook-login'), ['code' => $code, 'state' => $state])
            ->assertRedirect("{$expectedAfterUrlRedirect}#");

        app()->forgetInstance(FacebookLoginController::class);
    }

    public function loginProvider(): array {
        return [
            'Explicit after login url' => ['https://lift-tracker.com/me'],
            'No after login url' => [null],
        ];
    }

}
