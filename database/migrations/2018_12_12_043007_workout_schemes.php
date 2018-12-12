<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class WorkoutSchemes extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('workout_schemes', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name')->nullable(false);
            $table->string('definition_class')->nullable(false);
            $table->timestamps();
        });

        Schema::create('workout_blueprints', function (Blueprint $table) {
            //the plan is to use uuid for anything that is going to be directly public exposed
            $table->uuid('id');
            $table->string('name')->nullable(false);
            $table->integer('normal_day');
            $table->integer('user_id');
            $table->integer('workout_scheme')->nullable(false);
            $table->timestamps();
        });

        Schema::create('workout_blueprint_exercises', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('workout_blueprint_id');
            $table->integer('exercise_id');
            $table->integer('sets');
            $table->integer('position');
            $table->timestamps();
        });

        Schema::create('exercises', function (Blueprint $table) {
            //the plan is to use uuid for anything that is going to be directly public exposed
            $table->uuid('id');
            $table->string('name');
            $table->integer('user_id');
            $table->timestamps();
        });

        Schema::create('workouts', function (Blueprint $table) {
            //the plan is to use uuid for anything that is going to be directly public exposed
            $table->uuid('id');
            $table->dateTime('start_time');
            $table->dateTime('end_time');
            $table->date('date');
            $table->integer('user_id')->nullable(false);
            $table->timestamps();
        });

        Schema::create('workout_exercises', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('workout_id')->nullable(false);
            $table->integer('exercise_id')->nullable(false);
            $table->timestamps();
        });

        Schema::create('workout_exercise_sets', function (Blueprint $table) {
            //the plan is to use uuid for anything that is going to be directly public exposed
            $table->uuid('id');
            $table->string('name');
            $table->integer('user_id');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('workout_schemes');
        Schema::dropIfExists('workout_blueprints');
        Schema::dropIfExists('workout_blueprint_exercises');
        Schema::dropIfExists('exercises');
        Schema::dropIfExists('workouts');
        Schema::dropIfExists('workout_exercises');
        Schema::dropIfExists('workout_exercise_sets');
    }
}
