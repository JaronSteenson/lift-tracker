<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangeWorkoutToCamel extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::statement('
            RENAME TABLE workout_programs to WorkoutPrograms;
        ');

        DB::statement('
            ALTER TABLE WorkoutPrograms
                CHANGE  column created_at createdAt timestamp NULL DEFAULT NULL,
                CHANGE  column updated_at updatedAt timestamp NULL DEFAULT NULL,
                CHANGE  column user_id userId int(11) DEFAULT NULL;
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
            RENAME TABLE WorkoutPrograms to workout_programs;
        ');

        DB::statement('
            ALTER TABLE WorkoutPrograms
                CHANGE  column createdAt created_at timestamp NULL DEFAULT NULL,
                CHANGE  column updatedAt updated_at timestamp NULL DEFAULT NULL,
                CHANGE  column userId user_id  int(11) DEFAULT NULL;
        ');
    }
}
