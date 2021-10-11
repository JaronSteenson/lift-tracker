<?php

namespace LiftTracker\Http\Controllers\Auth;

use Facebook\Exceptions\FacebookSDKException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Illuminate\Support\Facades\Auth;
use LiftTracker\Auth\FacebookAuthManager;
use LiftTracker\Domain\Users\AccountPurger;
use LiftTracker\Http\Controllers\Controller;
use Symfony\Component\HttpFoundation\Request;
use Illuminate\Config\Repository as Config;

class FacebookLoginDeleteAccountController extends FacebookLoginController
{

    /**
     * Authenticate from facebook.
     *
     * @throws FacebookSDKException
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Pull an url from config explicitly rather than trying to determine it from the request.
        // The app server url may not match the reverse proxy/public facing (Cloudflare) url due to http vs https.
        $redirectUrl = $this->config->get('app.facebook_app_delete_account_redirect_url');

        $this->facebookAuthService->revokeLogin(
            $user,
            $request->get('code'),
            $redirectUrl
        );

        (new AccountPurger())->purge($user);

        $this->guard()->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        $redirectTo = $request->root();

        // Empty hash fragment is added to remove Facebook's ugly one.
        // https://stackoverflow.com/questions/7131909/facebook-callback-appends-to-return-url
        return redirect("{$redirectTo}#");
    }
}
