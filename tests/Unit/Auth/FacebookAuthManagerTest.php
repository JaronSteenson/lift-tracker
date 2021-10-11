<?php

namespace Tests\Unit\Auth;

use Carbon\Carbon;
use DateTime;
use Facebook\Authentication\AccessToken;
use Facebook\Authentication\AccessTokenMetadata;
use Facebook\Authentication\OAuth2Client;
use Facebook\Exceptions\FacebookSDKException;
use Facebook\Facebook;
use Facebook\FacebookResponse;
use Facebook\GraphNodes\GraphUser;
use RuntimeException;
use Illuminate\Auth\AuthManager;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use LiftTracker\Auth\FacebookAuthManager;
use LiftTracker\User;
use Tests\TestCase;

class FacebookAuthManagerTest extends TestCase
{
    use DatabaseTransactions;

    private const FACEBOOK_USER_ID = 1300000000000000;

    /**
     * @throws FacebookSDKException
     */
    public function testRegisterANewUser(): void
    {
        $facebookUser = new GraphUser([
            'id' => static::FACEBOOK_USER_ID,
            'first_name' => 'Jaron',
            'last_name' => 'Steenson',
            'email' => 'jaronsteenson@gmail.com',
        ]);

        [$facebook, $authManager] = $this->buildMockDependencies($facebookUser);
        $facebookAuthManager = new FacebookAuthManager($facebook, $authManager);

        $user = (new User)->findByFacebookid(static::FACEBOOK_USER_ID);
        self::assertNull($user);

        $facebookAuthManager->registerOrLoginUser('', '');

        $user = (new User)->findByFacebookid(static::FACEBOOK_USER_ID);
        self::assertNotNull($user);
        self::assertEquals(static::FACEBOOK_USER_ID, $user->facebookId);
        self::assertEquals('Jaron', $user->firstName);
        self::assertEquals('Steenson', $user->lastName);
        self::assertEquals('jaronsteenson@gmail.com', $user->email);

        self::assertEquals($user->id, $authManager->loggedInWith->id);
    }

    /**
     * @throws FacebookSDKException
     */
    public function testLogsInAnExistingUser(): void
    {
        $user = (new User)->whereNotNull('facebookId')->first();
        self::assertNotEquals('NewFirstNameFromFacebook', $user->firstName);
        self::assertNotEquals('NewLastNameFromFacebook', $user->lastName);
        self::assertNotEquals('newEmailFromFacebook@example.com', $user->email);

        $facebookUserId = $user->facebookId;

        $facebookUser = new GraphUser([
            'id' => $facebookUserId,
            'first_name' => 'NewFirstNameFromFacebook',
            'last_name' => 'NewLastNameFromFacebook',
            'email' => 'newEmailFromFacebook@example.com',
        ]);

        [$facebook, $authManager] = $this->buildMockDependencies($facebookUser);
        $facebookAuthManager = new FacebookAuthManager($facebook, $authManager);

        $facebookAuthManager->registerOrLoginUser('', '');
        $user->refresh();

        self::assertNotNull($user);
        self::assertEquals($facebookUserId, $user->facebookId);
        self::assertEquals('NewFirstNameFromFacebook', $user->firstName);
        self::assertEquals('NewLastNameFromFacebook', $user->lastName);
        self::assertEquals('newEmailFromFacebook@example.com', $user->email);

        self::assertEquals($user->id, $authManager->loggedInWith->id);
    }

    /**
     * @throws FacebookSDKException
     */
    public function testCanRegisterWithMissingFields(): void
    {
        $facebookUser = new GraphUser([
            'id' => static::FACEBOOK_USER_ID,
            'first_name' => null,
            'last_name' => null,
            'email' => null,
        ]);

        [$facebook, $authManager] = $this->buildMockDependencies($facebookUser);
        $facebookAuthManager = new FacebookAuthManager($facebook, $authManager);

        $user = (new User)->findByFacebookid(static::FACEBOOK_USER_ID);
        self::assertNull($user);

        // Register/create user.
        $facebookAuthManager->registerOrLoginUser('', '');

        $user = (new User)->findByFacebookid(static::FACEBOOK_USER_ID);
        self::assertNotNull($user);
        self::assertEquals(static::FACEBOOK_USER_ID, $user->facebookId);
        self::assertNull($user->firstName);
        self::assertNull($user->lastName);
        self::assertNull($user->email);

        self::assertEquals($user->id, $authManager->loggedInWith->id);


        // Login/update user.
        $facebookAuthManager->registerOrLoginUser('', '');

        $user = (new User)->findByFacebookid(static::FACEBOOK_USER_ID);
        self::assertNotNull($user);
        self::assertEquals(static::FACEBOOK_USER_ID, $user->facebookId);
        self::assertNull($user->firstName);
        self::assertNull($user->lastName);
        self::assertNull($user->email);

        self::assertEquals($user->id, $authManager->loggedInWith->id);
    }

    /**
     * @throws FacebookSDKException
     * @dataProvider failsWhenAccessTokenIsInvalidProvider
     */
    public function testFailsWhenAccessTokenIsInvalid(bool $validAppId, bool $validExpiration): void
    {
        $this->expectException(FacebookSDKException::class);

        $facebookUser = new GraphUser([
            'id' => static::FACEBOOK_USER_ID,
            'first_name' => 'Jaron',
            'last_name' => 'Steenson',
            'email' => 'jaronsteenson@gmail.com',
        ]);

        $user = (new User)->findByFacebookId(static::FACEBOOK_USER_ID);
        self::assertNull($user);

        [$facebook, $authManager] = $this->buildMockDependencies($facebookUser, $validAppId, $validExpiration);
        $facebookAuthManager = new FacebookAuthManager($facebook, $authManager);

        try {
            $facebookAuthManager->registerOrLoginUser('', '');
        } finally {
            $user = (new User)->findByFacebookId(static::FACEBOOK_USER_ID);
            self::assertNull($user);
            self::assertNull($authManager->loggedInWith);
        }

    }

    public function failsWhenAccessTokenIsInvalidProvider(): array {
        return [
            'Invalid app id' => [false, true],
            'Expired token' => [true, false],
        ];
    }

    /**
     * @throws FacebookSDKException
     * @doesNotPerformAssertions
     */
    public function testConfirmReAuth(): void
    {
        $user = (new User)->whereNotNull('facebookId')->first();
        $facebookUserId = $user->facebookId;

        $facebookUser = new GraphUser([
            'id' => $facebookUserId,
            'first_name' => 'NewFirstNameFromFacebook',
            'last_name' => 'NewLastNameFromFacebook',
            'email' => 'newEmailFromFacebook@example.com',
        ]);

        [$facebook, $authManager] = $this->buildMockDependencies($facebookUser);
        $facebookAuthManager = new FacebookAuthManager($facebook, $authManager);

        $facebookAuthManager->confirmReAuth($user,'', '');
    }

    /**
     * @throws FacebookSDKException
     */
    public function testConfirmReAuthFailsWhenAnotherUserIsLoggedIn(): void
    {
        $user = (new User)->whereNotNull('facebookId')->first();
        $facebookUserId = $user->facebookId;

        $facebookUser = new GraphUser([
            'id' => $facebookUserId,
            'first_name' => 'NewFirstNameFromFacebook',
            'last_name' => 'NewLastNameFromFacebook',
            'email' => 'newEmailFromFacebook@example.com',
        ]);

        [$facebook, $authManager] = $this->buildMockDependencies($facebookUser);
        $facebookAuthManager = new FacebookAuthManager($facebook, $authManager);

        $loggedInUser = new User();
        $loggedInUser->id = -1;

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Re-auth failed');
        $facebookAuthManager->confirmReAuth($loggedInUser,'', '');
    }

    /**
     * @throws FacebookSDKException
     */
    public function testConfirmReAuthFailsWhenFacebookUserIsNotInDatabase(): void
    {
        $user = (new User)->whereNotNull('facebookId')->first();
        $facebookUserId = $user->facebookId;

        $facebookUser = new GraphUser([
            'id' => -1,
            'first_name' => 'NewFirstNameFromFacebook',
            'last_name' => 'NewLastNameFromFacebook',
            'email' => 'newEmailFromFacebook@example.com',
        ]);

        [$facebook, $authManager] = $this->buildMockDependencies($facebookUser);
        $facebookAuthManager = new FacebookAuthManager($facebook, $authManager);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Re-auth failed');
        $facebookAuthManager->confirmReAuth($user,'', '');
    }

    /**
     * @param GraphUser $facebookUser
     * @param bool $validAppId
     * @param bool $validExpiration
     * @return Facebook[]|AuthManager[]
     */
    private function buildMockDependencies(GraphUser $facebookUser, $validAppId = true, $validExpiration = true): array
    {
        $accessTokenMetadata = new class($validAppId, $validExpiration) extends AccessTokenMetadata {
            private $validAppId;
            private $validExpiration;

            public function __construct(bool $validAppId, bool $validExpiration)
            {
                $this->validAppId = $validAppId;
                $this->validExpiration = $validExpiration;
            }

            public function validateAppId($appId): void
            {
                if (!$this->validAppId) {
                    parent::validateAppId($appId);
                }
            }

            public function getExpiresAt(): DateTime
            {
                if ($this->validExpiration) {
                    return Carbon::tomorrow()->toDateTime();
                }

                return Carbon::yesterday()->toDateTime();
            }
        };


        $oAuth2Client = new class($accessTokenMetadata) extends OAuth2Client {
            private $accessTokenMetadata;

            public function __construct(AccessTokenMetadata $accessTokenMetadata)
            {
                $this->accessTokenMetadata = $accessTokenMetadata;
            }

            public function getAccessTokenFromCode($code, $redirectUri = ''): AccessToken
            {
                return new AccessToken('fake-access-token');
            }

            public function debugToken($accessToken): AccessTokenMetadata
            {
                return $this->accessTokenMetadata;
            }

        };

        $facebook = new class($oAuth2Client, $facebookUser) extends Facebook {
            private $facebookUser;

            public function __construct(OAuth2Client $oAuth2Client, GraphUser $facebookUser)
            {
                parent::__construct(['app_id' => 'fake', 'app_secret' => 'fake']);
                $this->oAuth2Client = $oAuth2Client;
                $this->facebookUser = $facebookUser;
            }

            public function get($endpoint, $accessToken = null, $eTag = null, $graphVersion = null): FacebookResponse
            {
                return new class($this->facebookUser) extends FacebookResponse {
                    private $graphUser;

                    public function __construct(GraphUser $graphUser)
                    {
                        $this->graphUser = $graphUser;
                    }

                    public function getGraphUser(): GraphUser
                    {
                        return $this->graphUser;
                    }
                };
            }
        };

        $authManager = new class extends AuthManager {
            public function __construct()
            {

            }

            /**
             * @var User
             */
            public $loggedInWith;

            public function login(User $user)
            {
                $this->loggedInWith = $user;
            }
        };

        return [$facebook, $authManager];
    }

}
