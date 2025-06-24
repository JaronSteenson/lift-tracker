namespace LiftTrackerApi.Entities;

public partial class SessionExercise
{
    public uint Id { get; set; }

    public Guid Uuid { get; set; }

    public string Name { get; set; } = null!;

    public uint WorkoutSessionId { get; set; }

    public uint? RoutineExerciseId { get; set; }

    public decimal? PlannedWeight { get; set; }

    public uint? PlannedRestPeriodDuration { get; set; }

    public string? Notes { get; set; }

    public uint Position { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }

    public bool Skipped { get; set; }

    public int? PlannedWarmUp { get; set; }

    public DateTime? WarmUpStartedAt { get; set; }

    public DateTime? WarmUpEndedAt { get; set; }

    public uint? WarmUpDuration { get; set; }

    public virtual ICollection<SessionSet> SessionSets { get; set; } = new List<SessionSet>();

    public virtual WorkoutSession WorkoutSession { get; set; } = null!;
}
