using System.ComponentModel.DataAnnotations;
using LiftTrackerApi.Entities.Interfaces;

namespace LiftTrackerApi.Entities;

public partial class WorkoutProgramRoutine : DomainEntity, IPositionable
{
    [Required(ErrorMessage = "Name is required")]
    [StringLength(
        100,
        MinimumLength = 1,
        ErrorMessage = "Name must be between 1 and 100 characters"
    )]
    public string? Name { get; set; }

    public string? NormalDay { get; set; }

    public int? WorkoutProgramId { get; set; }

    /// <inheritdoc/>
    public int Position { get; set; }

    public virtual ICollection<RoutineExercise> RoutineExercises { get; set; } =
        new List<RoutineExercise>();

    public virtual WorkoutProgram? WorkoutProgram { get; set; }
}
