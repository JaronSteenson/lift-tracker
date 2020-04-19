<?php

namespace LiftTracker\Http\Controllers\Auth;

use Illuminate\Http\Request;
use LiftTracker\Domain\AppBootstrapData;
use LiftTracker\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\AuthenticatesUsers;

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
    protected $redirectTo = '';

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest')->except('logout');
    }

    /**
     * Overridden for use with vue, instead of redirecting return bootstrap json data instead.
     * @param Request $request
     * @return AppBootstrapData
     */
    public function sendLoginResponse(Request $request): AppBootstrapData
    {
        return new AppBootstrapData();
    }
}
