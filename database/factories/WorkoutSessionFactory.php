<?php

use Faker\Generator as Faker;

$factory->define(LiftTracker\Domain\Workouts\Sessions\WorkoutSession::class, function (Faker $faker) {
    return [
        'name' => $faker->name,
    ];
});
