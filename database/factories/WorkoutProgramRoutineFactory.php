<?php

use Faker\Generator as Faker;

$factory->define(LiftTracker\Domain\Workouts\Programs\WorkoutProgramRoutine::class, function (Faker $faker) {
    return [
        'name' => $faker->name,
    ];
});
