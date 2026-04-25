using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LiftTrackerApi.Migrations
{
    /// <inheritdoc />
    public partial class RemoveUnusedTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "createdAt",
                table: "WorkoutSessions",
                type: "timestamp",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp"
            );

            migrationBuilder.AlterColumn<string>(
                name: "name",
                table: "WorkoutPrograms",
                type: "varchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(255)",
                oldMaxLength: 255
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "createdAt",
                table: "WorkoutPrograms",
                type: "timestamp",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp"
            );

            migrationBuilder.AlterColumn<string>(
                name: "name",
                table: "WorkoutProgramRoutines",
                type: "varchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(255)",
                oldMaxLength: 255
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "createdAt",
                table: "WorkoutProgramRoutines",
                type: "timestamp",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp"
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "createdAt",
                table: "Users",
                type: "timestamp",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp"
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "createdAt",
                table: "SessionSets",
                type: "timestamp",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp"
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "createdAt",
                table: "SessionExercises",
                type: "timestamp",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp"
            );

            migrationBuilder.AlterColumn<string>(
                name: "name",
                table: "RoutineExercises",
                type: "varchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(255)",
                oldMaxLength: 255
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "createdAt",
                table: "RoutineExercises",
                type: "timestamp",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "createdAt",
                table: "WorkoutSessions",
                type: "timestamp",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "timestamp",
                oldNullable: true
            );

            migrationBuilder.AlterColumn<string>(
                name: "name",
                table: "WorkoutPrograms",
                type: "varchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "varchar(255)",
                oldMaxLength: 255,
                oldNullable: true
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "createdAt",
                table: "WorkoutPrograms",
                type: "timestamp",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "timestamp",
                oldNullable: true
            );

            migrationBuilder.AlterColumn<string>(
                name: "name",
                table: "WorkoutProgramRoutines",
                type: "varchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "varchar(255)",
                oldMaxLength: 255,
                oldNullable: true
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "createdAt",
                table: "WorkoutProgramRoutines",
                type: "timestamp",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "timestamp",
                oldNullable: true
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "createdAt",
                table: "Users",
                type: "timestamp",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "timestamp",
                oldNullable: true
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "createdAt",
                table: "SessionSets",
                type: "timestamp",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "timestamp",
                oldNullable: true
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "createdAt",
                table: "SessionExercises",
                type: "timestamp",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "timestamp",
                oldNullable: true
            );

            migrationBuilder.AlterColumn<string>(
                name: "name",
                table: "RoutineExercises",
                type: "varchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "varchar(255)",
                oldMaxLength: 255,
                oldNullable: true
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "createdAt",
                table: "RoutineExercises",
                type: "timestamp",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "timestamp",
                oldNullable: true
            );
        }
    }
}
