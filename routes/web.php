<?php /** @noinspection ALL */

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

Auth::routes();

/** @see \LiftTracker\Http\Controllers\Api\WorkoutProgramController */
Route::apiResource('api/workout-programs', 'Api\WorkoutProgramController')->middleware('auth');


/** @see \LiftTracker\Http\Controllers\VueAppController */
Route::get('/{any}', 'VueAppController@index')->where('any','.*');
