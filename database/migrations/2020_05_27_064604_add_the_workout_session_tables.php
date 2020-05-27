<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddTheWorkoutSessionTables extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::dropIfExists('workout_session_exercises_sets');
        Schema::dropIfExists('workout_session');

        Schema::dropIfExists('SessionSets');
        Schema::dropIfExists('SessionExercises');
        Schema::dropIfExists('WorkoutSessions');

        Schema::create('WorkoutSessions', static function (Blueprint $table) {
            $table->increments('id');

            $table->string('uuid', '36')->index();

            $table->integer('workoutProgramId')->nullable()->index();
            $table->integer('userId')->nullable()->index();

            $table->string('name')->nullable();

            $table->timestamp('startedAt')->nullable();
            $table->timestamp('endedAt')->nullable();

            $table->text('notes')->nullable();

            $table->timestamp('createdAt')->nullable();
            $table->timestamp('updatedAt')->nullable();
        });

        Schema::create('SessionExercises', static function (Blueprint $table) {
            $table->increments('id');

            $table->string('uuid', '36')->index();

            $table->unsignedInteger('workoutSessionId');
            $table->foreign('workoutSessionId')
                ->references('id')
                ->on('WorkoutSessions');

            $table->integer('workoutProgramRoutineId')->nullable()->index();

            $table->integer('plannedReps')->nullable();
            $table->integer('plannedWeight')->nullable();
            $table->integer('plannedRestPeriodDuration')->nullable();

            $table->text('notes')->nullable();

            $table->timestamp('createdAt')->nullable();
            $table->timestamp('updatedAt')->nullable();
        });

        Schema::create('SessionSets', static function (Blueprint $table) {
            $table->increments('id');

            $table->string('uuid', '36')->index();

            $table->unsignedInteger('sessionExerciseId');
            $table->foreign('sessionExerciseId')
                ->references('id')
                ->on('SessionExercises');

            $table->integer('routineExerciseId')->nullable()->index();

            $table->integer('reps')->nullable();

            $table->integer('weight')->nullable();

            $table->integer('restPeriodDuration')->nullable();
            $table->timestamp('restPeriodStartedAt')->nullable();
            $table->timestamp('restPeriodEndedAt')->nullable();

            $table->timestamp('createdAt')->nullable();
            $table->timestamp('updatedAt')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('SessionSets');
        Schema::dropIfExists('SessionExercises');
        Schema::dropIfExists('WorkoutSessions');
    }
}
