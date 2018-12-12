<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AlterTableForignKeysToBeMoreHuman extends Migration
{
    private static $fieldNameFromToMap = [
        'user_workout_programs' => ['workout_scheme_id' => 'workout_program_id'],
        'workout_session_exercises' => ['workout_id' => 'workout_session_id'],
        'workout_session_template' => ['workout_scheme' => 'workout_program_id'],
        'workout_session_template_exercises' => ['workout_blueprint_id' => 'workout_session_template_id']
    ];

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        foreach (static::$fieldNameFromToMap as $tableName => $columnNames) {
            $to = reset($columnNames);
            $from = key($columnNames);

            Schema::table($tableName, function(Blueprint $table) use ($from, $to){
                $table->renameColumn($from, $to);
            });
        }

        Schema::table('workout_session_exercises_sets', function(Blueprint $table) {
            $table->integer('workout_session_exercise_id')->nullable(false);
            $table->integer('position')->nullable(false);
        });

        DB::table('workout_programs')->update([
                'definition_class' => 'PushPullLegsProgramDefinitions'
        ]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        foreach (static::$fieldNameFromToMap as $tableName => $columnNames) {
            //specifiably backwards
            $from = reset($columnNames);
            $to = key($columnNames);

            Schema::table($tableName, function(Blueprint $table) use ($from, $to){
                $table->renameColumn($from, $to);
            });
        }

        Schema::table('workout_session_exercises_sets', function(Blueprint $table) {
            $table->dropColumn('workout_session_exercise_id');
            $table->dropColumn('position');
        });

        DB::table('workout_programs')->update([
            'definition_class' => 'PushPullLegsWorkoutSchemeDefinition'
        ]);
    }
}
