<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangeRepsAndSetsToDecimal42 extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::unprepared('
            alter table RoutineExercises
                change column `id` `id` int not null auto_increment first,
                change column `weight` `weight` decimal(6, 2) signed;
        ');

        DB::unprepared('
            alter table SessionExercises
                change column `plannedWeight` `plannedWeight` decimal(6, 2) signed;
        ');

        DB::unprepared('
            alter table SessionSets
                change column `reps` `reps` decimal(6, 2) unsigned,
                change column `weight` `weight` decimal(6, 2) signed;
        ');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::unprepared('
            alter table RoutineExercises
                change column `weight` `weight` int unsigned;
        ');

        DB::unprepared('
            alter table SessionExercises
                change column `weight` `weight` int unsigned;
        ');

        DB::unprepared('
            alter table SessionSets
                change column `reps` `reps` int unsigned,
                change column `weight` `weight` int unsigned;
        ');
    }
}
