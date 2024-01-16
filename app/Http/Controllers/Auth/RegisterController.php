<?php

namespace LiftTracker\Http\Controllers\Auth;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use LiftTracker\Domain\AppBootstrapData;
use LiftTracker\Rules\UserNotExists;
use LiftTracker\User;
use LiftTracker\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Foundation\Auth\RegistersUsers;

class RegisterController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Register Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles the registration of new users as well as their
    | validation and creation. By default this controller uses a trait to
    | provide this functionality without requiring any additional code.
    |
    */

    use RegistersUsers;

    /**
     * Where to redirect users after registration.
     *
     * @var string
     */
    protected $redirectTo = '/login';

    /**
     * The user has been registered.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  User  $user
     * @return mixed
     */
    protected function registered(Request $request, User $user)
    {
        return $user->hasVerifiedEmail();
    }

    /**
     * Get a validator for an incoming registration request.
     *
     * @param  array  $data
     * @return \Illuminate\Contracts\Validation\Validator
     */
    protected function validator(array $data): \Illuminate\Contracts\Validation\Validator
    {
        return Validator::make($data, [
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255',  new UserNotExists],
            'password' => 'required|string|min:6',
        ]);
    }

    /**
     * Handle a registration request for the application.
     */
    public function register(Request $request): AppBootstrapData
    {
        $this->validator($request->all())->validate();

        $data = $request->all();
        // They might have already started the sign-up process,
        // but didn't go through the email verification.
        $user = User::findByUnverifiedEmail($data['email']);
        if ($user) {
            $user = $this->update($user, $data);
        } else {
            $user = $this->create($data);
        }

        $user->sendEmailVerificationNotification();
        Auth::login($user);

        return new AppBootstrapData();
    }

    /**
     * Create a new user instance after a valid registration.
     *
     * @param  array  $data
     * @return \LiftTracker\User
     */
    protected function create(array $data): User
    {
        return User::create([
            'firstName' => $data['firstName'],
            'lastName' => $data['lastName'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);
    }

    protected function update(User $user, array $data): User
    {
        $user->fill([
            'firstName' => $data['firstName'],
            'lastName' => $data['lastName'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ])->save();
        return $user;
    }
}
