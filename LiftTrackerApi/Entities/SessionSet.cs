namespace LiftTrackerApi.Entities;

public partial class SessionSet : DomainEntity
{
    public int SessionExerciseId { get; set; }

    public decimal? Reps { get; set; }

    public decimal? Weight { get; set; }

    public int? RestPeriodDuration { get; set; }

    public DateTime? RestPeriodStartedAt { get; set; }

    public DateTime? RestPeriodEndedAt { get; set; }

    public int Position { get; set; }
    public DateTime? StartedAt { get; set; }

    public DateTime? EndedAt { get; set; }

    public DateTime? WarmUpStartedAt { get; set; }

    public DateTime? WarmUpEndedAt { get; set; }

    public int? WarmUpDuration { get; set; }

    public virtual SessionExercise SessionExercise { get; set; } = null!;
}
