<?php

use Faker\Generator as Faker;

$factory->define(LiftTracker\Domain\Workouts\Programs\WorkoutProgram::class, function (Faker $faker) {
    return [
        'name' => $faker->name,
    ];
});
