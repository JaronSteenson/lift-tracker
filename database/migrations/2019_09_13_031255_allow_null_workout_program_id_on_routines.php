<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AllowNullWorkoutProgramIdOnRoutines extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::statement('
                ALTER TABLE `WorkoutProgramRoutines` MODIFY `workoutProgramId` char(36) NULL;
        ');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::statement('
                ALTER TABLE `WorkoutProgramRoutines` MODIFY `workoutProgramId` char(36) NOT NULL;
        ');
    }
}
