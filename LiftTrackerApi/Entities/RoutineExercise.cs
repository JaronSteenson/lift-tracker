using LiftTrackerApi.Entities.Interfaces;

namespace LiftTrackerApi.Entities;

public partial class RoutineExercise : DomainEntity, IPositionable
{
    public string? Name { get; set; }

    public int? NumberOfSets { get; set; }

    public int? WorkoutProgramRoutineId { get; set; }

    /// <inheritdoc/>
    public int Position { get; set; }

    public decimal? Weight { get; set; }

    public int? RestPeriod { get; set; }

    public int? WarmUp { get; set; }

    public virtual WorkoutProgramRoutine? WorkoutProgramRoutine { get; set; }
}
