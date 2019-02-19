<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class RemoveUserWorkoutProgram extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::table('workout_programs', function (Blueprint $table) {
            $table->integer('user_id')->nullable(); //no user id -> community workout programs, is a future idea
        });

        Schema::drop('user_workout_programs');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::table('workout_programs', function (Blueprint $table) {
            $table->dropColumn('user_id');
        });

        $sql = '
            CREATE TABLE `user_workout_programs` (
              `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
              `user_id` int(11) NOT NULL,
              `workout_program_id` int(11) NOT NULL,
              `created_at` timestamp NULL DEFAULT NULL,
              `updated_at` timestamp NULL DEFAULT NULL,
              PRIMARY KEY (`id`)
            );
        ';

        DB::statement($sql);
    }
}
