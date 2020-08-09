<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangeToSoftDeleting extends Migration
{
    private static $tables = [
        'WorkoutSessions',
        'SessionSets',
        'SessionExercises',
        'WorkoutPrograms',
        'WorkoutProgramRoutines',
        'RoutineExercises',
    ];

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        foreach (self::$tables as $tableName) {
            Schema::table($tableName, static function (Blueprint $table) {
                $table->softDeletes('deletedAt', 0);
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        foreach (self::$tables as $tableName) {
            Schema::table($tableName, static function (Blueprint $table) use ($tableName) {
                $table->dropSoftDeletes('deletedAt');
            });
        }
    }
}
