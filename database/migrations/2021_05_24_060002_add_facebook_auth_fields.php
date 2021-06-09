<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Migrations\Migration;

class AddFacebookAuthFields extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        DB::unprepared('
            alter table `users` rename to `Users`,
                drop column `email_verified_at`,
                drop column `password`,
                drop column `remember_token`,
                change column `name` `firstName` varchar(255),
                add column `lastName` varchar(255) after `firstName`,
                add column `facebookId` bigint unsigned,
                add column `facebookAccessToken` varchar(255),
                change column `created_at` `createdAt` timestamp null default null after facebookAccessToken,
                change column `updated_at` `updatedAt` timestamp null default null after createdAt,
                change column `email` `email` varchar(255) null,
                drop index `users_email_unique`,
                add unique (facebookId)
        ');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        DB::unprepared('
            alter table `Users` rename to `users`,
                add column `email_verified_at` timestamp,
                add column `password` varchar(255) not null,
                add column `remember_token` varchar(100),
                change column `firstName` `name` varchar(255),
                drop column `lastName`,
                drop column `facebookId`,
                drop column `facebookAccessToken`,
                change column `createdAt` `created_at` timestamp null default null,
                change column `updatedAt` `updated_at` timestamp null default null,
                change column `email` `email` varchar(255) not null,
                add unique (email),
                drop index `facebookId`
        ');
    }
}
