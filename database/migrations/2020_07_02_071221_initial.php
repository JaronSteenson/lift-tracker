<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class Initial extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::unprepared('
            CREATE TABLE `password_resets`
            (
                `email`      varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
                `token`      varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
                `created_at` timestamp                               NULL DEFAULT NULL,
                KEY `password_resets_email_index` (`email`)
            ) ENGINE = InnoDB
              DEFAULT CHARSET = utf8mb4
              COLLATE = utf8mb4_unicode_ci;
        ');

        DB::unprepared('
            CREATE TABLE `users`
            (
                `id`                int unsigned                            NOT NULL AUTO_INCREMENT,
                `name`              varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
                `email`             varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
                `email_verified_at` timestamp                               NULL DEFAULT NULL,
                `password`          varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
                `remember_token`    varchar(100) COLLATE utf8mb4_unicode_ci      DEFAULT NULL,
                `created_at`        timestamp                               NULL DEFAULT NULL,
                `updated_at`        timestamp                               NULL DEFAULT NULL,
                PRIMARY KEY (`id`),
                UNIQUE KEY `users_email_unique` (`email`)
            ) ENGINE = InnoDB
              DEFAULT CHARSET = utf8mb4
              COLLATE = utf8mb4_unicode_ci;
        ');

        DB::unprepared('
            CREATE TABLE `Exercises`
            (
                `id`        char(36) COLLATE utf8mb4_unicode_ci     NOT NULL,
                `name`      varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
                `userId`    int                                          DEFAULT NULL,
                `createdAt` timestamp                               NULL DEFAULT NULL,
                `updatedAt` timestamp                               NULL DEFAULT NULL
            ) ENGINE = InnoDB
              DEFAULT CHARSET = utf8mb4
              COLLATE = utf8mb4_unicode_ci;
        ');

        DB::unprepared('
            CREATE TABLE `WorkoutPrograms`
            (
                `name`      varchar(255) COLLATE utf8mb4_unicode_ci  DEFAULT NULL,
                `createdAt` timestamp                           NULL DEFAULT NULL,
                `updatedAt` timestamp                           NULL DEFAULT NULL,
                `uuid`      char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                `userId`    int                                      DEFAULT NULL,
                `id`        int                                 NOT NULL AUTO_INCREMENT,
                PRIMARY KEY (`id`),
                UNIQUE KEY `idx_uuid` (`uuid`)
            ) ENGINE = InnoDB
              DEFAULT CHARSET = utf8mb4
              COLLATE = utf8mb4_unicode_ci;
        ');

        DB::unprepared('
            CREATE TABLE `WorkoutProgramRoutines`
            (
                `uuid`             char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
                `name`             varchar(255)                                                                      DEFAULT NULL,
                `normalDay`        enum (\'any\',\'Monday\',\'Tuesday\',\'Wensday\',\'Thursday\',\'Friday\',\'Saturday\',\'Sunday\') DEFAULT \'any\',
                `workoutProgramId` int                                                                               DEFAULT NULL,
                `createdAt`        timestamp                                                 NULL                    DEFAULT NULL,
                `updatedAt`        timestamp                                                 NULL                    DEFAULT NULL,
                `position`         int                                                       NOT NULL,
                `id`               int                                                       NOT NULL AUTO_INCREMENT,
                PRIMARY KEY (`id`),
                UNIQUE KEY `idx_uuid` (`uuid`),
                KEY `WorkoutProgramRoutines_ibfk_1` (`workoutProgramId`),
                CONSTRAINT `WorkoutProgramRoutines_ibfk_1` FOREIGN KEY (`workoutProgramId`) REFERENCES `WorkoutPrograms` (`id`) ON DELETE CASCADE
            ) ENGINE = InnoDB
              DEFAULT CHARSET = utf8;
        ');

        DB::unprepared('
            CREATE TABLE `RoutineExercises`
            (
                `uuid`                    char(36)  NOT NULL,
                `name`                    varchar(255)   DEFAULT NULL,
                `numberOfSets`            int            DEFAULT NULL,
                `createdAt`               timestamp NULL DEFAULT NULL,
                `updatedAt`               timestamp NULL DEFAULT NULL,
                `workoutProgramRoutineId` int            DEFAULT NULL,
                `position`                int       NOT NULL,
                `id`                      int       NOT NULL AUTO_INCREMENT,
                `weight`                  int            DEFAULT NULL,
                `restPeriod`              int            DEFAULT NULL,
                PRIMARY KEY (`id`),
                UNIQUE KEY `idx_uuid` (`uuid`),
                KEY `RoutineExercises_ibfk_1` (`workoutProgramRoutineId`),
                CONSTRAINT `RoutineExercises_ibfk_1` FOREIGN KEY (`workoutProgramRoutineId`) REFERENCES `WorkoutProgramRoutines` (`id`) ON DELETE CASCADE
            ) ENGINE = InnoDB
              DEFAULT CHARSET = utf8;
        ');

        DB::unprepared('
            CREATE TABLE `WorkoutSessions`
            (
                `id`                      int unsigned                        NOT NULL AUTO_INCREMENT,
                `uuid`                    char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                `workoutProgramRoutineId` int unsigned                             DEFAULT NULL,
                `userId`                  int unsigned                             DEFAULT NULL,
                `name`                    varchar(100) COLLATE utf8mb4_unicode_ci  DEFAULT NULL,
                `startedAt`               timestamp                           NULL DEFAULT NULL,
                `endedAt`                 timestamp                           NULL DEFAULT NULL,
                `notes`                   text COLLATE utf8mb4_unicode_ci,
                `createdAt`               timestamp                           NULL DEFAULT NULL,
                `updatedAt`               timestamp                           NULL DEFAULT NULL,
                PRIMARY KEY (`id`),
                KEY `workoutsessions_uuid_index` (`uuid`),
                KEY `workoutsessions_workoutprogramroutineid_index` (`workoutProgramRoutineId`),
                KEY `workoutsessions_userid_index` (`userId`)
            ) ENGINE = InnoDB
              DEFAULT CHARSET = utf8mb4
              COLLATE = utf8mb4_unicode_ci;
        ');

        DB::unprepared('
            CREATE TABLE `SessionExercises`
            (
                `id`                        int unsigned                         NOT NULL AUTO_INCREMENT,
                `uuid`                      char(36) COLLATE utf8mb4_unicode_ci  NOT NULL,
                `name`                      char(100) COLLATE utf8mb4_unicode_ci NOT NULL,
                `workoutSessionId`          int unsigned                         NOT NULL,
                `routineExerciseId`         int unsigned                              DEFAULT NULL,
                `plannedWeight`             int unsigned                              DEFAULT NULL,
                `plannedRestPeriodDuration` int unsigned                              DEFAULT NULL,
                `notes`                     text COLLATE utf8mb4_unicode_ci,
                `position`                  int unsigned                         NOT NULL,
                `createdAt`                 timestamp                            NULL DEFAULT NULL,
                `updatedAt`                 timestamp                            NULL DEFAULT NULL,
                PRIMARY KEY (`id`),
                KEY `sessionexercises_workoutsessionid_foreign` (`workoutSessionId`),
                KEY `sessionexercises_uuid_index` (`uuid`),
                KEY `sessionexercises_routineexerciseid_index` (`routineExerciseId`),
                CONSTRAINT `sessionexercises_workoutsessionid_foreign` FOREIGN KEY (`workoutSessionId`) REFERENCES `WorkoutSessions` (`id`) ON DELETE CASCADE
            ) ENGINE = InnoDB
              DEFAULT CHARSET = utf8mb4
              COLLATE = utf8mb4_unicode_ci;
        ');

        DB::unprepared('
            CREATE TABLE `SessionSets`
            (
                `id`                  int unsigned                        NOT NULL AUTO_INCREMENT,
                `uuid`                char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                `sessionExerciseId`   int unsigned                        NOT NULL,
                `reps`                int unsigned                             DEFAULT NULL,
                `weight`              int unsigned                             DEFAULT NULL,
                `restPeriodDuration`  int unsigned                             DEFAULT NULL,
                `restPeriodStartedAt` timestamp                           NULL DEFAULT NULL,
                `restPeriodEndedAt`   timestamp                           NULL DEFAULT NULL,
                `position`            int unsigned                        NOT NULL,
                `createdAt`           timestamp                           NULL DEFAULT NULL,
                `updatedAt`           timestamp                           NULL DEFAULT NULL,
                PRIMARY KEY (`id`),
                KEY `sessionsets_sessionexerciseid_foreign` (`sessionExerciseId`),
                KEY `sessionsets_uuid_index` (`uuid`),
                CONSTRAINT `sessionsets_sessionexerciseid_foreign` FOREIGN KEY (`sessionExerciseId`) REFERENCES `SessionExercises` (`id`) ON DELETE CASCADE
            ) ENGINE = InnoDB
              DEFAULT CHARSET = utf8mb4
              COLLATE = utf8mb4_unicode_ci;
        ');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
