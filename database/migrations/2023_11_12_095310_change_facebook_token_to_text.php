<?php

use Illuminate\Database\Migrations\Migration;

class ChangeFacebookTokenToText extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::unprepared('
            alter table Users
                modify column facebookAccessToken text;
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
            alter table Users
                modify column facebookAccessToken varchar(255);
        ');
    }
}
