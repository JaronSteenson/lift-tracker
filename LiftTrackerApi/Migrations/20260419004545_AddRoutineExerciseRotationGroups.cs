using System;
using Microsoft.EntityFrameworkCore.Migrations;
using MySql.EntityFrameworkCore.Metadata;

#nullable disable

namespace LiftTrackerApi.Migrations
{
    /// <inheritdoc />
    public partial class AddRoutineExerciseRotationGroups : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameIndex(
                name: "idx_uuid2",
                table: "WorkoutPrograms",
                newName: "idx_uuid3");

            migrationBuilder.RenameIndex(
                name: "idx_uuid3",
                table: "WorkoutProgramRoutines",
                newName: "idx_uuid4");

            migrationBuilder.RenameIndex(
                name: "idx_uuid1",
                table: "Users",
                newName: "idx_uuid2");

            migrationBuilder.AddColumn<int>(
                name: "rotationGroupPosition",
                table: "RoutineExercises",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "routineExerciseRotationGroupId",
                table: "RoutineExercises",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "RoutineExerciseRotationGroups",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    nextExerciseIndex = table.Column<int>(type: "int", nullable: false),
                    workoutProgramRoutineId = table.Column<int>(type: "int", nullable: true),
                    uuid = table.Column<Guid>(type: "char(36)", nullable: true),
                    createdAt = table.Column<DateTime>(type: "timestamp", nullable: true),
                    updatedAt = table.Column<DateTime>(type: "timestamp", nullable: true),
                    deletedAt = table.Column<DateTime>(type: "timestamp", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PRIMARY", x => x.id);
                    table.ForeignKey(
                        name: "RoutineExerciseRotationGroups_ibfk_1",
                        column: x => x.workoutProgramRoutineId,
                        principalTable: "WorkoutProgramRoutines",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_RoutineExercises_routineExerciseRotationGroupId",
                table: "RoutineExercises",
                column: "routineExerciseRotationGroupId");

            migrationBuilder.CreateIndex(
                name: "idx_uuid1",
                table: "RoutineExerciseRotationGroups",
                column: "uuid",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "RoutineExerciseRotationGroups_ibfk_1",
                table: "RoutineExerciseRotationGroups",
                column: "workoutProgramRoutineId");

            migrationBuilder.AddForeignKey(
                name: "FK_RoutineExercises_RoutineExerciseRotationGroups_routineExerci~",
                table: "RoutineExercises",
                column: "routineExerciseRotationGroupId",
                principalTable: "RoutineExerciseRotationGroups",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RoutineExercises_RoutineExerciseRotationGroups_routineExerci~",
                table: "RoutineExercises");

            migrationBuilder.DropTable(
                name: "RoutineExerciseRotationGroups");

            migrationBuilder.DropIndex(
                name: "IX_RoutineExercises_routineExerciseRotationGroupId",
                table: "RoutineExercises");

            migrationBuilder.DropColumn(
                name: "rotationGroupPosition",
                table: "RoutineExercises");

            migrationBuilder.DropColumn(
                name: "routineExerciseRotationGroupId",
                table: "RoutineExercises");

            migrationBuilder.RenameIndex(
                name: "idx_uuid3",
                table: "WorkoutPrograms",
                newName: "idx_uuid2");

            migrationBuilder.RenameIndex(
                name: "idx_uuid4",
                table: "WorkoutProgramRoutines",
                newName: "idx_uuid3");

            migrationBuilder.RenameIndex(
                name: "idx_uuid2",
                table: "Users",
                newName: "idx_uuid1");
        }
    }
}
