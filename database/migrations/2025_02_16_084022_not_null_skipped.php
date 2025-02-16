<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class NotNullSkipped extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::unprepared('
            update SessionExercises set skipped = false where skipped is null;
            alter table SessionExercises
                modify column `skipped` boolean default false not null;
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
            update SessionExercises set skipped = false where skipped is null;
        ');
    }
}
