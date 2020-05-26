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
Route::post('api/login', 'Auth\LoginController@login');

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

//Route::get('api/workout-program/by-routine/', 'Api\WorkoutProgramController@byRoutine')
//    ->middleware('auth');

/**
 *  Catch all route.
 * @see \LiftTracker\Http\Controllers\VueAppController
 */
Route::get('/{any}', 'VueAppController@index')->where('any','.*');
