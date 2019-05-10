<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangeExcerciseToCamel extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::statement('
            RENAME TABLE exercises to Exercises;
        ');

        DB::statement('
            ALTER TABLE Exercises
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
            RENAME TABLE Exercises to exercises;
        ');

        DB::statement('
            ALTER TABLE exercises
                CHANGE  column created_at createdAt timestamp NULL DEFAULT NULL,
                CHANGE  column updated_at updatedAt timestamp NULL DEFAULT NULL,
                CHANGE  column user_id userId  int(11) DEFAULT NULL;
        ');
    }
}

