<?php

namespace LiftTracker\Http\Controllers\Auth;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use LiftTracker\Domain\AppBootstrapData;
use LiftTracker\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use LiftTracker\Rules\UserExists;

class LoginController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Login Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles authenticating users for the application and
    | redirecting them to your home screen. The controller uses a trait
    | to conveniently provide its functionality to your applications.
    |
    */

    use AuthenticatesUsers;

    /**
     * Where to redirect users after login.
     *
     * @var string
     */
    protected $redirectTo = '/verification-email-sent';

    public function login(Request $request): AppBootstrapData
    {
        $request->validate(['email' => new UserExists]);

        $credentials = $request->only('email', 'password');
        if (!Auth::attempt($credentials)) {
            throw new AuthenticationException('Password is incorrect');
        }

        return new AppBootstrapData();
    }

    /**
     * Overridden for use with vue, instead of redirecting return bootstrap json data instead.
     *
     * @param Request $request
     * @return AppBootstrapData
     */
    public function logout(Request $request): AppBootstrapData
    {
        $this->guard()->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return new AppBootstrapData();
    }

}
