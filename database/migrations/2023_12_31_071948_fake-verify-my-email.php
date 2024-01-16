<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class FakeVerifyMyEmail extends Migration
{
    public function up(): void
    {
        DB::unprepared("update Users set emailVerifiedAt = now() where email != 'jaronsteenson@gmail.com';");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::unprepared("update Users set emailVerifiedAt = null where email != 'jaronsteenson@gmail.com';");
    }
}
