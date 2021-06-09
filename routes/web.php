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
 * Auth logout.
 * @see \LiftTracker\Http\Controllers\Auth\LoginController
 */
Route::post('api/logout', 'Auth\LoginController@logout');

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
    ->middleware('auth');

/**
 * Workout session endpoints.
 * @see \LiftTracker\Http\Controllers\Api\WorkoutSessionController
 */
Route::apiResource('api/workout-sessions', 'Api\WorkoutSessionController')
    ->middleware('auth');

/**
 * Workout session exercise endpoints.
 * @see \LiftTracker\Http\Controllers\Api\SessionExerciseController
 */
Route::apiResource('api/sessions-exercises', 'Api\SessionExerciseController')
    ->middleware('auth');

/**
 * Workout session exercise endpoints.
 * @see \LiftTracker\Http\Controllers\Api\SessionSetController
 */
Route::apiResource('api/sessions-sets', 'Api\SessionSetController')
    ->middleware('auth');

/**
 * @see \LiftTracker\Http\Controllers\Api\SessionExercisePreviousEntries
 */
Route::get('api/session-exercise-previous-entries/{sessionExerciseUuid}', 'Api\SessionExercisePreviousEntries')
    ->middleware('auth');

/**
 * @see \LiftTracker\Http\Controllers\Api\InProgressWorkoutSessions
 */
Route::get('api/in-progress-workouts', 'Api\InProgressWorkoutSessions')
    ->middleware('auth');

/**
 *  Authenticates the request from facebook's redirect.
 * @see \LiftTracker\Http\Controllers\Auth\FacebookLoginController
 */
Route::any('/facebook-login', 'Auth\FacebookLoginController@index')
    ->name('facebook-login')
    ->middleware('facebook-login');

/**
 * Catch all route.
 * @see \LiftTracker\Http\Controllers\VueAppController
 */
Route::get('/{any}', 'VueAppController@index')->where('any','.*');
