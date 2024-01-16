<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/
use Illuminate\Support\Facades\Route;

/**
 * App bootstrap endpoint.
 * @see \LiftTracker\Http\Controllers\Api\AppController
 */
Route::get('api/app', 'Api\AppController@index');

/**
 * Program builder endpoints.
 * @see \LiftTracker\Http\Controllers\Api\WorkoutProgramController
 */
Route::apiResource('api/workout-programs', 'Api\WorkoutProgramController')
    ->middleware('verified')
    ->middleware('auth');

/**
 * Program builder endpoints.
 * @see \LiftTracker\Http\Controllers\Api\WorkoutRoutineController
 */
Route::apiResource('api/workout-routines', 'Api\WorkoutRoutineController')
    ->middleware('verified')
    ->middleware('auth');

/**
 * Workout session endpoints.
 * @see \LiftTracker\Http\Controllers\Api\WorkoutSessionController
 */
Route::apiResource('api/workout-sessions', 'Api\WorkoutSessionController')
    ->middleware('verified')
    ->middleware('auth');

/**
 * Workout session exercise endpoints.
 * @see \LiftTracker\Http\Controllers\Api\SessionExerciseController
 */
Route::apiResource('api/sessions-exercises', 'Api\SessionExerciseController')
    ->middleware('verified')
    ->middleware('auth');

/**
 * Workout session exercise endpoints.
 * @see \LiftTracker\Http\Controllers\Api\SessionSetController
 */
Route::apiResource('api/sessions-sets', 'Api\SessionSetController')
    ->middleware('verified')
    ->middleware('auth');

/**
 * @see \LiftTracker\Http\Controllers\Api\SessionExercisePreviousEntries
 */
Route::get('api/session-exercise-previous-entries/{sessionExerciseUuid}', 'Api\SessionExercisePreviousEntries')
    ->middleware('verified')
    ->middleware('auth');

/**
 * @see \LiftTracker\Http\Controllers\Api\InProgressWorkoutSessions
 */
Route::get('api/in-progress-workouts', 'Api\InProgressWorkoutSessions')
    ->middleware('verified')
    ->middleware('auth');

/**
 * Authenticates the user with standard email/password auth.
 * @see \LiftTracker\Http\Controllers\Auth\LoginController::login()
 */
Route::post('api/login', 'Auth\LoginController@login')
    ->name('login');

/**
 * Un-authenticates the user with standard email/password auth.
 * @see \LiftTracker\Http\Controllers\Auth\LoginController::logout()
 */
Route::post('api/logout', 'Auth\LoginController@logout')
    ->name('logout');

/**
 * Un-authenticates the user with standard email/password auth.
 * @see \LiftTracker\Http\Controllers\Auth\RegisterController::register()
 */
Route::post('api/register', 'Auth\RegisterController@register')
    ->name('register');

/**
 * @see \LiftTracker\Http\Controllers\Auth\ResetPasswordController::sendResetLinkEmail()
 */
Route::post('api/send-password-reset-email', 'Auth\ResetPasswordController@sendResetLinkEmail')
    ->name('password.email');

/**
 * @see \LiftTracker\Http\Controllers\Auth\ResetPasswordController::reset()
 */
Route::post('api/password-reset', 'Auth\ResetPasswordController@reset')
    ->name('password.reset.post');

/**
 * Verify the users email during sign up flow.
 * @see \LiftTracker\Http\Controllers\Auth\VerificationController::verify()
 */
Route::get('verify-email', 'Auth\VerificationController@verify')
    ->name('verification.verify');
/**
 * Catch all route.
 * @see \LiftTracker\Http\Controllers\VueAppController
 */
Route::get('/{any}', 'VueAppController@index')->where('any', '.*');
