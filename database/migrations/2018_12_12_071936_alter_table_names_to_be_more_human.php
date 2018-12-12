<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AlterTableNamesToBeMoreHuman extends Migration
{

    private static $fromToMap = [
        'workout_schemes'               => 'workout_programs',
        'user_workout_schemes'          => 'user_workout_programs',
        'workout_blueprints'            => 'workout_session_template',
        'workout_blueprint_exercises'   => 'workout_session_template_exercises',
        'workouts'                      => 'workout_session',
        'workout_exercises'             => 'workout_session_exercises',
        'workout_exercise_sets'         => 'workout_session_exercises_sets',
    ];

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        foreach (static::$fromToMap as $from => $to) {
            Schema::rename($from, $to);
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        foreach (static::$fromToMap as $from => $to) {
            //specifically reversed
            Schema::rename($to, $from);
        }
    }
}
