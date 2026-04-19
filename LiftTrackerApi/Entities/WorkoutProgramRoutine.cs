using System.ComponentModel.DataAnnotations;
using LiftTrackerApi.Entities.Interfaces;

namespace LiftTrackerApi.Entities;

public partial class WorkoutProgramRoutine : DomainEntity, IPositionable
{
    [MaxLength(100, ErrorMessage = "Name must be at most 100 characters")]
    public string? Name { get; set; }

    public string? NormalDay { get; set; }

    public int? WorkoutProgramId { get; set; }

    /// <inheritdoc/>
    public int Position { get; set; }

    public virtual ICollection<RoutineExercise> RoutineExercises { get; set; } =
        new List<RoutineExercise>();

    public virtual ICollection<RoutineExerciseRotationGroup> RoutineExerciseRotationGroups { get; set; } =
        new List<RoutineExerciseRotationGroup>();

    public virtual WorkoutProgram? WorkoutProgram { get; set; }
}
