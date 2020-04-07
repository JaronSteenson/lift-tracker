<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class UseUuidAndIncrementingPrimaryKey extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        DB::statement('
                alter table `WorkoutPrograms`
                    drop primary key,
                    rename column id to uuid,
                    add unique index idx_uuid (uuid),
                    add column id int auto_increment primary key;
        ');

        DB::statement('
                alter table `WorkoutProgramRoutines`
                    drop primary key,
                    rename column id to uuid,
                    add unique index idx_uuid (uuid),
                    add column id int auto_increment primary key;
        ');

        DB::statement('
                delete from WorkoutProgramRoutines;
        ');

        DB::statement('
                alter table `WorkoutProgramRoutines`
                modify column workoutProgramId int,
                add foreign key (workoutProgramId) references WorkoutPrograms(id);
        ');

        DB::statement('
                delete from RoutineExercises;
        ');

        DB::statement('
                alter table `RoutineExercises`
                modify column workoutProgramRoutineId int,
                add foreign key (workoutProgramRoutineId) references WorkoutProgramRoutines(id),
                drop primary key,
                rename column id to uuid,
                add unique index idx_uuid (uuid),
                add column id int auto_increment primary key;
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
                ALTER TABLE `WorkoutPrograms`
                    rename column uuid to id,
                    drop column uuid;
        ');
    }
}
