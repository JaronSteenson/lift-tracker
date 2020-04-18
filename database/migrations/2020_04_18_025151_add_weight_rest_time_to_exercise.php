<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class addWeightRestTimeToExercise extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        DB::statement('
                alter table `RoutineExercises`
                    add column weight int,
                    add column restPeriod int;
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
                alter table `RoutineExercises`
                    drop column weight,
                    drop column restPeriod;
        ');
    }
}
