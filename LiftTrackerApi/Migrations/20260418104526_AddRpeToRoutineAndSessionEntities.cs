using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LiftTrackerApi.Migrations
{
    /// <inheritdoc />
    public partial class AddRpeToRoutineAndSessionEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "rpe",
                table: "SessionSets",
                type: "int",
                nullable: true
            );

            migrationBuilder.AddColumn<int>(
                name: "plannedRpe",
                table: "SessionExercises",
                type: "int",
                nullable: true
            );

            migrationBuilder.AddColumn<int>(
                name: "rpe",
                table: "RoutineExercises",
                type: "int",
                nullable: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "rpe", table: "SessionSets");

            migrationBuilder.DropColumn(name: "plannedRpe", table: "SessionExercises");

            migrationBuilder.DropColumn(name: "rpe", table: "RoutineExercises");
        }
    }
}
