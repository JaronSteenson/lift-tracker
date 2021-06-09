<?php

namespace LiftTracker\Http\Controllers\Auth;

use Facebook\Exceptions\FacebookSDKException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Illuminate\Support\Facades\Auth;
use LiftTracker\Auth\FacebookAuthManager;
use LiftTracker\Http\Controllers\Controller;
use Symfony\Component\HttpFoundation\Request;

class FacebookLoginController extends Controller
{

    use AuthenticatesUsers;

    /**
     * @var FacebookAuthManager
     */
    private $facebookAuthService;

    public function __construct(FacebookAuthManager $facebookAuthService)
    {
        parent::__construct();
        $this->facebookAuthService = $facebookAuthService;
    }

    /**
     * Authenticate from facebook.
     *
     * @throws FacebookSDKException
     * @throws AuthenticationException
     */
    public function index(Request $request)
    {
        if (Auth::check()) {
            throw new AuthenticationException('User is already logged in');
        }

        $this->facebookAuthService->registerOrLoginUser($request->get('code'), $request->url());

        $redirectTo = $request->get('after-login-url') ?: $request->root();

        // Empty hash fragment is added to remove Facebook's ugly one.
        // https://stackoverflow.com/questions/7131909/facebook-callback-appends-to-return-url
        return redirect("{$redirectTo}#");
    }
}
