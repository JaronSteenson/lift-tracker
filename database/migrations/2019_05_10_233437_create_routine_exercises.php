<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateRoutineExercises extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        DB::statement('
                CREATE TABLE `RoutineExercises` (
                    `id`           char(36) NOT NULL,
                    `name`         varchar(255) NOT NULL,
                    `numberOfSets` varchar(255) NOT NULL,
                    `createdAt`    timestamp                NULL DEFAULT NULL,
                    `updatedAt`    timestamp                NULL DEFAULT NULL
                )
        ');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::dropIfExists('RoutineExercises');
    }
}
