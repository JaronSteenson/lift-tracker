<?php

use Carbon\Carbon;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use Webpatser\Uuid\Uuid;

class AddBaseData extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     * @throws Exception
     */
    public function up()
    {
        //make workout schemes use uuid, as I think it will be public
        Schema::table('workout_schemes', function (Blueprint $table) {
            $table->dropColumn('id');
        });

        //change id  to the actual primary key and  make it a uuid as well
        Schema::table('workout_schemes', function (Blueprint $table) {
            $table->uuid('id');
            $table->primary('id');
        });

        DB::table('workout_schemes')->insert(
            [
                'id' => (string) Uuid::generate(4),
                'name' => 'Push, pull, legs',
                'definition_class' => 'PushPullLegsWorkoutSchemeDefinition',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]
        );

    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('workout_schemes', function (Blueprint $table) {
            $table->dropColumn('id');
        });

        Schema::table('workout_schemes', function (Blueprint $table) {
            $table->increments('id');
        });

        DB::table('workout_schemes')->truncate();
    }
}
