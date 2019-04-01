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

Auth::routes();

/** @see \LiftTracker\Http\Controllers\HomeController */
Route::get('/', 'HomeController@index')->name('home');

/** @see \LiftTracker\Http\Controllers\WorkoutProgramController */
Route::resource('workout-programs', 'WorkoutProgramController')->middleware('auth');

/** @see \LiftTracker\Http\Controllers\Api\WorkoutProgramController */
Route::resource('api/workout-programs', 'Api\WorkoutProgramController')->middleware('auth');