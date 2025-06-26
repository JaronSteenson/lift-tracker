using LiftTrackerApi.Entities.Interfaces;

namespace LiftTrackerApi.Entities;

public partial class SessionExercise : DomainEntity, IPositionable
{
    public string Name { get; set; } = null!;

    public int WorkoutSessionId { get; set; }

    public int? RoutineExerciseId { get; set; }

    public decimal? PlannedWeight { get; set; }

    public int? PlannedRestPeriodDuration { get; set; }

    public string? Notes { get; set; }

    /// <inheritdoc/>
    public int Position { get; set; }

    public bool Skipped { get; set; }

    public int? PlannedWarmUp { get; set; }

    public DateTime? WarmUpStartedAt { get; set; }

    public DateTime? WarmUpEndedAt { get; set; }

    public int? WarmUpDuration { get; set; }

    public virtual ICollection<SessionSet> SessionSets { get; set; } = new List<SessionSet>();

    public virtual WorkoutSession WorkoutSession { get; set; } = null!;
}
