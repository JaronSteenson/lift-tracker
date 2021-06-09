<?php

namespace LiftTracker\Auth;

use Facebook\Authentication\AccessToken;
use Facebook\Exceptions\FacebookSDKException;
use Facebook\Facebook;
use Facebook\GraphNodes\GraphUser;
use Illuminate\Auth\AuthManager;
use Illuminate\Support\Facades\DB;
use LiftTracker\User;

class FacebookAuthManager
{
    /**
     * @var Facebook
     */
    private $facebook;

    /**
     * @var AuthManager
     */
    private $authManager;

    /**
     * @param Facebook $facebook
     * @param AuthManager $authManager
     */
    public function __construct(Facebook $facebook, AuthManager $authManager)
    {
        $this->facebook = $facebook;
        $this->authManager = $authManager;
    }


    /**
     * @throws FacebookSDKException
     */
    public function registerOrLoginUser(string $shortLivedAccessCode, string $redirectUri): User
    {
        $accessToken = $this->fetchAccessToken($shortLivedAccessCode, $redirectUri);
        $this->validateAccessToken($accessToken);

        $facebookUser = $this->fetchFacebookUser($accessToken);
        $user = (new User)->findByFacebookId($facebookUser->getId());

        if ($user === null) {
            $user = new User();
            $user->setNewFacebookLink(
                $facebookUser->getId(),
                $facebookUser->getFirstName(),
                $facebookUser->getLastName(),
                $facebookUser->getEmail(),
                $accessToken
            );
        } else {
            $user->updateFacebookLink(
                $facebookUser->getFirstName(),
                $facebookUser->getLastName(),
                $facebookUser->getEmail(),
                $accessToken
            );
        }

        DB::transaction(function () use ($user) {
            $user->save();
            $this->authManager->login($user); // Equivalent to: $this->>authManager->guard()->login($user)
        });

        return $user;
    }

    /**
     * @throws FacebookSDKException
     */
    private function fetchAccessToken(string $shortLivedAccessCode, string $redirectUri): AccessToken
    {
        return $this->facebook->getOAuth2Client()->getAccessTokenFromCode($shortLivedAccessCode, $redirectUri);
    }

    /**
     * @throws FacebookSDKException
     */
    private function validateAccessToken(AccessToken $accessToken): void
    {
        $tokenMetadata = $this->facebook->getOAuth2Client()->debugToken($accessToken);
        $tokenMetadata->validateAppId($this->facebook->getApp()->getId());
        $tokenMetadata->validateExpiration();
    }

    /**
     * @throws FacebookSDKException
     */
    private function fetchFacebookUser(AccessToken $accessToken): GraphUser
    {
        $response = $this->facebook->get('/me?fields=id, email, first_name, last_name', $accessToken);

        return $response->getGraphUser();
    }

}
