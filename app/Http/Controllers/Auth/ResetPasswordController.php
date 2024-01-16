<?php

namespace LiftTracker\Http\Controllers\Auth;

use Illuminate\Foundation\Auth\SendsPasswordResetEmails;
use Illuminate\Http\Request;
use LiftTracker\Domain\AppBootstrapData;
use LiftTracker\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\ResetsPasswords;
use LiftTracker\Rules\UserExists;

class ResetPasswordController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Password Reset Controller
    |--------------------------------------------------------------------------
    |
    | This controller is responsible for handling password reset requests
    | and uses a simple trait to include this behavior. You're free to
    | explore this trait and override any methods you wish to tweak.
    |
    */
    use SendsPasswordResetEmails {
        // Password broker is the same, credentials are only email on ResetsPasswords.
        ResetsPasswords::broker insteadof SendsPasswordResetEmails;
        ResetsPasswords::credentials insteadof SendsPasswordResetEmails;
    }
    use ResetsPasswords;

    /**
     * Where to redirect users after resetting their password.
     *
     * @var string
     */
    protected $redirectTo = '';

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
    }

    protected function validateEmail(Request $request): void
    {
        $request->validate(['email' => ['required', 'email', new UserExists]]);
    }

    protected function sendResetResponse(): AppBootstrapData
    {
        return new AppBootstrapData();
    }
}
