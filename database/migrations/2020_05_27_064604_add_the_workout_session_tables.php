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

            $table->char('uuid', '36')->index();

            $table->unsignedInteger('workoutProgramId')->nullable()->index();
            $table->unsignedInteger('userId')->nullable()->index();

            $table->string('name', 100)->nullable();

            $table->timestamp('startedAt')->nullable();
            $table->timestamp('endedAt')->nullable();

            $table->text('notes')->nullable();

            $table->timestamp('createdAt')->nullable();
            $table->timestamp('updatedAt')->nullable();
        });

        Schema::create('SessionExercises', static function (Blueprint $table) {
            $table->increments('id');

            $table->char('uuid', '36')->index();
            $table->char('name', 100);

            $table->unsignedInteger('workoutSessionId');
            $table->foreign('workoutSessionId')
                ->references('id')
                ->on('WorkoutSessions');

            $table->unsignedInteger('routineExerciseId')->nullable()->index();

            $table->unsignedInteger('plannedWeight')->nullable();
            $table->unsignedInteger('plannedRestPeriodDuration')->nullable();

            $table->text('notes')->nullable();

            $table->unsignedInteger('position');

            $table->timestamp('createdAt')->nullable();
            $table->timestamp('updatedAt')->nullable();
        });

        Schema::create('SessionSets', static function (Blueprint $table) {
            $table->increments('id');

            $table->char('uuid', '36')->index();

            $table->unsignedInteger('sessionExerciseId');
            $table->foreign('sessionExerciseId')
                ->references('id')
                ->on('SessionExercises');

            $table->unsignedInteger('reps')->nullable();
            $table->unsignedInteger('weight')->nullable();

            $table->unsignedInteger('restPeriodDuration')->nullable();
            $table->timestamp('restPeriodStartedAt')->nullable();
            $table->timestamp('restPeriodEndedAt')->nullable();

            $table->unsignedInteger('position');

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
