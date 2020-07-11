<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class SetStartEndTimes extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::unprepared('
            ALTER TABLE `SessionSets`
                ADD COLUMN `startedAt`         timestamp                           NULL DEFAULT NULL,
                ADD COLUMN `endedAt`           timestamp                           NULL DEFAULT NULL;
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
            ALTER TABLE `SessionSets`
                DROP COLUMN `startedAt`,
                DROP COLUMN `endedAt`;
        ');
    }
}
