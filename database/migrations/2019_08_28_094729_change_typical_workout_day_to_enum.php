<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangeTypicalWorkoutDayToEnum extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::statement('
                ALTER TABLE `WorkoutProgramRoutines` 
                    MODIFY COLUMN `normalDay` 
                        ENUM("any", "Monday", "Tuesday", "Wensday", "Thursday", "Friday", "Saturday", "Sunday") DEFAULT "any";
        ');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // (7) is actually one character short of fitting "Saturday".
        DB::statement('
                ALTER TABLE `WorkoutProgramRoutines` 
                    MODIFY COLUMN `normalDay` varchar(7) NOT NULL; 
        ');
    }
}
