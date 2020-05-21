<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddOnDeleteCascade extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::statement('
            alter table WorkoutProgramRoutines
            drop constraint WorkoutProgramRoutines_ibfk_1;
        ');

        DB::statement('
            alter table WorkoutProgramRoutines
            add constraint WorkoutProgramRoutines_ibfk_1
            foreign key (workoutProgramId)
            references WorkoutPrograms (id)
            on delete cascade;
        ');

        DB::statement('
            alter table RoutineExercises
            drop constraint RoutineExercises_ibfk_1;
        ');
        DB::statement('
            alter table RoutineExercises
            add constraint RoutineExercises_ibfk_1
            foreign key (workoutProgramRoutineId)
            references WorkoutProgramRoutines (id)
            on delete cascade;
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
            alter table WorkoutProgramRoutines
            drop constraint WorkoutProgramRoutines_ibfk_1;
        ');

        DB::statement('
            alter table WorkoutProgramRoutines
            add constraint WorkoutProgramRoutines_ibfk_1
            foreign key (workoutProgramId)
            references WorkoutPrograms (id);
        ');

        DB::statement('
            alter table RoutineExercises
            drop constraint RoutineExercises_ibfk_1;
        ');
        DB::statement('
            alter table RoutineExercises
            add constraint RoutineExercises_ibfk_1
            foreign key (workoutProgramRoutineId)
            references WorkoutProgramRoutines (id);
         ');
    }
}
