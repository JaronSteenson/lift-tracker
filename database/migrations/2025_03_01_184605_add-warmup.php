<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddWarmup extends Migration
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
                add column warmUp int null;
            alter table SessionExercises
                add column plannedWarmUp int null;
            alter table SessionExercises
                add column warmUpStartedAt timestamp null;
            alter table SessionExercises
                add column warmUpEndedAt timestamp null;
            alter table SessionExercises
                add column warmUpDuration int unsigned null;
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
                drop column warmUpTime;
            alter table SessionExercises
                drop column plannedWarmUp;
            alter table SessionExercises
                drop column warmUpStartedAt;
            alter table SessionExercises
                drop column warmUpEndedAt;
            alter table SessionExercises
                drop column warmUpDuration;
        ');
    }
}
