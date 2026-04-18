using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LiftTrackerApi.Migrations
{
    /// <inheritdoc />
    public partial class AddProgressionSchemesToRoutineAndSessionExercises : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "progressionScheme",
                table: "SessionExercises",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "progressionScheme",
                table: "RoutineExercises",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "progressionSchemeSettings",
                table: "RoutineExercises",
                type: "json",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "progressionScheme",
                table: "SessionExercises");

            migrationBuilder.DropColumn(
                name: "progressionScheme",
                table: "RoutineExercises");

            migrationBuilder.DropColumn(
                name: "progressionSchemeSettings",
                table: "RoutineExercises");
        }
    }
}
