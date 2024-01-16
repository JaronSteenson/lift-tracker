<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class StandardAuth extends Migration
{
    public function up(): void
    {
        DB::unprepared("delete from Users where email != 'jaronsteenson@gmail.com';");
        DB::unprepared(
            '
            alter table `Users`
                drop index facebookId,
                add column `emailVerifiedAt` timestamp                               NULL DEFAULT NULL,
                add column `password`        varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
                add column `rememberToken`   varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
                drop column `facebookId`,
                drop column `facebookAccessToken`,
                add unique (email)
            '
        );
    }

        /**
         * Reverse the migrations.
         *
         * @return void
         */
        public
        function down()
        {
            DB::unprepared(
                '
                alter table `Users`
                    add unique (facebookId),
                    drop column `emailVerifiedAt`,
                    drop column `password`,
                    drop column `rememberToken`,
                    add column `facebookId` bigint unsigned null,
                    add column `facebookAccessToken` text null,
                    drop constraint email
            '
            );
        }
    }
