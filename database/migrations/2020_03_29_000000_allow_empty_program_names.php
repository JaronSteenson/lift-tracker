<?php

use Illuminate\Database\Migrations\Migration;

class AllowEmptyProgramNames extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        DB::statement('
                ALTER TABLE `WorkoutPrograms`
                    MODIFY `name` varchar(255) NULL;
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
                ALTER TABLE `WorkoutPrograms`
                    MODIFY `name` varchar(255) NOT NULL
        ');
    }
}
