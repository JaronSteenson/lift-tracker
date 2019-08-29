<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Migrations\Migration;

class FixUuidPrimaryKeys extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        DB::statement('
                ALTER TABLE `WorkoutProgramRoutines`  ADD PRIMARY KEY(`id`);
        ');
        DB::statement('
                ALTER TABLE `RoutineExercises`  ADD PRIMARY KEY(`id`);
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
                ALTER TABLE `WorkoutProgramRoutines`  DROP PRIMARY KEY;
        ');

        DB::statement('
                ALTER TABLE `RoutineExercises`  DROP PRIMARY KEY;
        ');
    }
}
