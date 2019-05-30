<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddWorkoutProgramRoutineIdColumn extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        DB::statement('
                ALTER TABLE `RoutineExercises` 
                    ADD COLUMN `workoutProgramRoutineId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL;
        ');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        DB::statement('
                ALTER TABLE `RoutineExercises` 
                    DROP COLUMN `workoutProgramRoutineId`;
        ');
    }
}
