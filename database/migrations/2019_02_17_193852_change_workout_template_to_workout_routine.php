<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Migrations\Migration;

class ChangeWorkoutTemplateToWorkoutRoutine extends Migration
{
    private static $fieldNameFromToMap = [
        'workout_session_template' => 'workout_routine',
        'workout_session_template_exercises' => 'workout_routine_exercises',
    ];

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        foreach (static::$fieldNameFromToMap as $from => $to) {
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
        foreach (static::$fieldNameFromToMap as $to => $from) {
            Schema::rename($from, $to);
        }
    }
}
