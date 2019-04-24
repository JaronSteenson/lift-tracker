<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Migrations\Migration;

class ChangeWorkoutProgramToCamelCase extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::statement('drop table `workout_routine`;');

        DB::statement('
            CREATE TABLE `WorkoutProgramRoutines` (
               `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
               `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
               `normalDay` varchar(7) NOT NULL,
               `workoutProgramId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
               `createdAt` timestamp NULL DEFAULT NULL,
               `updatedAt` timestamp NULL DEFAULT NULL
            );
        ');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::statement('drop table `WorkoutProgramRoutines`;');

        DB::statement('
            CREATE TABLE `workout_routine` (
                `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
                `normal_day` int(11) NOT NULL,
                `user_id` int(11) NOT NULL,
                `workout_program_id` int(11) NOT NULL,
                `created_at` timestamp NULL DEFAULT NULL,
                `updated_at` timestamp NULL DEFAULT NULL
            );
        ');
    }
}
