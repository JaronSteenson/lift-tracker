<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class NullableNamesAndPersistPositions extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::statement('
                ALTER TABLE `WorkoutProgramRoutines` 
                    MODIFY `name` varchar(255) NULL,
                    ADD COLUMN `position` int(1) NOT NULL;
        ');

        DB::statement('
                ALTER TABLE `RoutineExercises` 
                    MODIFY `name` varchar(255) NULL,
                    ADD COLUMN `position` int(1) NOT NULL;
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
                ALTER TABLE `WorkoutProgramRoutines` 
                    MODIFY `name` varchar(255) NOT NULL,
                    DROP COLUMN `position`;
        ');

        DB::statement('
                ALTER TABLE `RoutineExercises` 
                    MODIFY `name` varchar(255) NOT NULL,
                    DROP COLUMN `position`;
        ');
    }
}
