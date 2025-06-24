using System;
using Microsoft.EntityFrameworkCore.Migrations;
using MySql.EntityFrameworkCore.Metadata;

#nullable disable

namespace LiftTrackerApi.Migrations
{
    /// <inheritdoc />
    public partial class LoadOriginalSchemaDump : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Exercises",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false),
                    name = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false),
                    userId = table.Column<int>(type: "int", nullable: true),
                    createdAt = table.Column<DateTime>(type: "timestamp", nullable: true),
                    updatedAt = table.Column<DateTime>(type: "timestamp", nullable: true)
                },
                constraints: table =>
                {
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "migrations",
                columns: table => new
                {
                    id = table.Column<uint>(type: "int unsigned", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    migration = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false),
                    batch = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PRIMARY", x => x.id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "password_resets",
                columns: table => new
                {
                    email = table.Column<string>(type: "varchar(255)", nullable: false),
                    token = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp", nullable: true)
                },
                constraints: table =>
                {
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    id = table.Column<uint>(type: "int unsigned", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    firstName = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true),
                    lastName = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true),
                    email = table.Column<string>(type: "varchar(255)", nullable: true),
                    createdAt = table.Column<DateTime>(type: "timestamp", nullable: true),
                    updatedAt = table.Column<DateTime>(type: "timestamp", nullable: true),
                    emailVerifiedAt = table.Column<DateTime>(type: "timestamp", nullable: true),
                    password = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false),
                    rememberToken = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PRIMARY", x => x.id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "WorkoutPrograms",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    name = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true),
                    createdAt = table.Column<DateTime>(type: "timestamp", nullable: true),
                    updatedAt = table.Column<DateTime>(type: "timestamp", nullable: true),
                    uuid = table.Column<Guid>(type: "char(36)", nullable: false),
                    userId = table.Column<int>(type: "int", nullable: true),
                    deletedAt = table.Column<DateTime>(type: "timestamp", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PRIMARY", x => x.id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "WorkoutSessions",
                columns: table => new
                {
                    id = table.Column<uint>(type: "int unsigned", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    uuid = table.Column<Guid>(type: "char(36)", nullable: false),
                    workoutProgramRoutineId = table.Column<uint>(type: "int unsigned", nullable: true),
                    userId = table.Column<uint>(type: "int unsigned", nullable: true),
                    name = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true),
                    startedAt = table.Column<DateTime>(type: "timestamp", nullable: true),
                    endedAt = table.Column<DateTime>(type: "timestamp", nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    createdAt = table.Column<DateTime>(type: "timestamp", nullable: true),
                    updatedAt = table.Column<DateTime>(type: "timestamp", nullable: true),
                    deletedAt = table.Column<DateTime>(type: "timestamp", nullable: true),
                    bodyWeight = table.Column<decimal>(type: "decimal(6,2)", precision: 6, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PRIMARY", x => x.id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "WorkoutProgramRoutines",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    uuid = table.Column<Guid>(type: "char(36)", nullable: false),
                    name = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true),
                    normalDay = table.Column<string>(type: "enum('any','Monday','Tuesday','Wensday','Thursday','Friday','Saturday','Sunday')", nullable: true, defaultValueSql: "'any'"),
                    workoutProgramId = table.Column<int>(type: "int", nullable: true),
                    createdAt = table.Column<DateTime>(type: "timestamp", nullable: true),
                    updatedAt = table.Column<DateTime>(type: "timestamp", nullable: true),
                    position = table.Column<int>(type: "int", nullable: false),
                    deletedAt = table.Column<DateTime>(type: "timestamp", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PRIMARY", x => x.id);
                    table.ForeignKey(
                        name: "WorkoutProgramRoutines_ibfk_1",
                        column: x => x.workoutProgramId,
                        principalTable: "WorkoutPrograms",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "SessionExercises",
                columns: table => new
                {
                    id = table.Column<uint>(type: "int unsigned", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    uuid = table.Column<Guid>(type: "char(36)", nullable: false),
                    name = table.Column<string>(type: "char(100)", fixedLength: true, maxLength: 100, nullable: false),
                    workoutSessionId = table.Column<uint>(type: "int unsigned", nullable: false),
                    routineExerciseId = table.Column<uint>(type: "int unsigned", nullable: true),
                    plannedWeight = table.Column<decimal>(type: "decimal(6,2)", precision: 6, nullable: true),
                    plannedRestPeriodDuration = table.Column<uint>(type: "int unsigned", nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    position = table.Column<uint>(type: "int unsigned", nullable: false),
                    createdAt = table.Column<DateTime>(type: "timestamp", nullable: true),
                    updatedAt = table.Column<DateTime>(type: "timestamp", nullable: true),
                    deletedAt = table.Column<DateTime>(type: "timestamp", nullable: true),
                    skipped = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    plannedWarmUp = table.Column<int>(type: "int", nullable: true),
                    warmUpStartedAt = table.Column<DateTime>(type: "timestamp", nullable: true),
                    warmUpEndedAt = table.Column<DateTime>(type: "timestamp", nullable: true),
                    warmUpDuration = table.Column<uint>(type: "int unsigned", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PRIMARY", x => x.id);
                    table.ForeignKey(
                        name: "sessionexercises_workoutsessionid_foreign",
                        column: x => x.workoutSessionId,
                        principalTable: "WorkoutSessions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "RoutineExercises",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    uuid = table.Column<Guid>(type: "char(36)", nullable: false),
                    name = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true),
                    numberOfSets = table.Column<int>(type: "int", nullable: true),
                    createdAt = table.Column<DateTime>(type: "timestamp", nullable: true),
                    updatedAt = table.Column<DateTime>(type: "timestamp", nullable: true),
                    workoutProgramRoutineId = table.Column<int>(type: "int", nullable: true),
                    position = table.Column<int>(type: "int", nullable: false),
                    weight = table.Column<decimal>(type: "decimal(6,2)", precision: 6, nullable: true),
                    restPeriod = table.Column<int>(type: "int", nullable: true),
                    deletedAt = table.Column<DateTime>(type: "timestamp", nullable: true),
                    warmUp = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PRIMARY", x => x.id);
                    table.ForeignKey(
                        name: "RoutineExercises_ibfk_1",
                        column: x => x.workoutProgramRoutineId,
                        principalTable: "WorkoutProgramRoutines",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "SessionSets",
                columns: table => new
                {
                    id = table.Column<uint>(type: "int unsigned", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    uuid = table.Column<Guid>(type: "char(36)", nullable: false),
                    sessionExerciseId = table.Column<uint>(type: "int unsigned", nullable: false),
                    reps = table.Column<decimal>(type: "decimal(6,2)", nullable: true),
                    weight = table.Column<decimal>(type: "decimal(6,2)", precision: 6, nullable: true),
                    restPeriodDuration = table.Column<uint>(type: "int unsigned", nullable: true),
                    restPeriodStartedAt = table.Column<DateTime>(type: "timestamp", nullable: true),
                    restPeriodEndedAt = table.Column<DateTime>(type: "timestamp", nullable: true),
                    position = table.Column<uint>(type: "int unsigned", nullable: false),
                    createdAt = table.Column<DateTime>(type: "timestamp", nullable: true),
                    updatedAt = table.Column<DateTime>(type: "timestamp", nullable: true),
                    startedAt = table.Column<DateTime>(type: "timestamp", nullable: true),
                    endedAt = table.Column<DateTime>(type: "timestamp", nullable: true),
                    deletedAt = table.Column<DateTime>(type: "timestamp", nullable: true),
                    warmUpStartedAt = table.Column<DateTime>(type: "timestamp", nullable: true),
                    warmUpEndedAt = table.Column<DateTime>(type: "timestamp", nullable: true),
                    warmUpDuration = table.Column<uint>(type: "int unsigned", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PRIMARY", x => x.id);
                    table.ForeignKey(
                        name: "sessionsets_sessionexerciseid_foreign",
                        column: x => x.sessionExerciseId,
                        principalTable: "SessionExercises",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "password_resets_email_index",
                table: "password_resets",
                column: "email");

            migrationBuilder.CreateIndex(
                name: "idx_uuid",
                table: "RoutineExercises",
                column: "uuid",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "RoutineExercises_ibfk_1",
                table: "RoutineExercises",
                column: "workoutProgramRoutineId");

            migrationBuilder.CreateIndex(
                name: "sessionexercises_routineexerciseid_index",
                table: "SessionExercises",
                column: "routineExerciseId");

            migrationBuilder.CreateIndex(
                name: "sessionexercises_uuid_index",
                table: "SessionExercises",
                column: "uuid");

            migrationBuilder.CreateIndex(
                name: "sessionexercises_workoutsessionid_foreign",
                table: "SessionExercises",
                column: "workoutSessionId");

            migrationBuilder.CreateIndex(
                name: "sessionsets_sessionexerciseid_foreign",
                table: "SessionSets",
                column: "sessionExerciseId");

            migrationBuilder.CreateIndex(
                name: "sessionsets_uuid_index",
                table: "SessionSets",
                column: "uuid");

            migrationBuilder.CreateIndex(
                name: "email",
                table: "Users",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "email_2",
                table: "Users",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_uuid2",
                table: "WorkoutProgramRoutines",
                column: "uuid",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "WorkoutProgramRoutines_ibfk_1",
                table: "WorkoutProgramRoutines",
                column: "workoutProgramId");

            migrationBuilder.CreateIndex(
                name: "idx_uuid1",
                table: "WorkoutPrograms",
                column: "uuid",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "workoutsessions_createdat_index",
                table: "WorkoutSessions",
                column: "createdAt");

            migrationBuilder.CreateIndex(
                name: "workoutsessions_userid_index",
                table: "WorkoutSessions",
                column: "userId");

            migrationBuilder.CreateIndex(
                name: "workoutsessions_uuid_index",
                table: "WorkoutSessions",
                column: "uuid");

            migrationBuilder.CreateIndex(
                name: "workoutsessions_workoutprogramroutineid_index",
                table: "WorkoutSessions",
                column: "workoutProgramRoutineId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Exercises");

            migrationBuilder.DropTable(
                name: "migrations");

            migrationBuilder.DropTable(
                name: "password_resets");

            migrationBuilder.DropTable(
                name: "RoutineExercises");

            migrationBuilder.DropTable(
                name: "SessionSets");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "WorkoutProgramRoutines");

            migrationBuilder.DropTable(
                name: "SessionExercises");

            migrationBuilder.DropTable(
                name: "WorkoutPrograms");

            migrationBuilder.DropTable(
                name: "WorkoutSessions");
        }
    }
}
