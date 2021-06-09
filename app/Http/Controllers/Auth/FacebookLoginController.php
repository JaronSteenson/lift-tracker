<?php

namespace LiftTracker\Http\Controllers\Auth;

use Facebook\Exceptions\FacebookSDKException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Illuminate\Support\Facades\Auth;
use LiftTracker\Auth\FacebookAuthManager;
use LiftTracker\Http\Controllers\Controller;
use Symfony\Component\HttpFoundation\Request;
use Illuminate\Config\Repository as Config;

class FacebookLoginController extends Controller
{

    use AuthenticatesUsers;

    /**
     * @var FacebookAuthManager
     */
    private $facebookAuthService;

    /**
     * @var Config
     */
    private $config;

    public function __construct(FacebookAuthManager $facebookAuthService, Config $config)
    {
        parent::__construct();
        $this->facebookAuthService = $facebookAuthService;
        $this->config = $config;
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

        // Pull an url from config explicitly rather than trying to determine it from the request.
        // The app server url may not match the reverse proxy/public facing (Cloudflare) url due to http vs https.
        $redirectUrl = $this->config->get('app.facebook_app_redirect_url');

        $this->facebookAuthService->registerOrLoginUser(
            $request->get('code'),
            $redirectUrl
        );

        $redirectTo = $request->get('after-login-url') ?: $request->root();

        // Empty hash fragment is added to remove Facebook's ugly one.
        // https://stackoverflow.com/questions/7131909/facebook-callback-appends-to-return-url
        return redirect("{$redirectTo}#");
    }
}
