namespace LiftTrackerApi.Entities;

public partial class SessionSet
{
    public uint Id { get; set; }

    public Guid Uuid { get; set; }

    public uint SessionExerciseId { get; set; }

    public decimal? Reps { get; set; }

    public decimal? Weight { get; set; }

    public uint? RestPeriodDuration { get; set; }

    public DateTime? RestPeriodStartedAt { get; set; }

    public DateTime? RestPeriodEndedAt { get; set; }

    public uint Position { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? StartedAt { get; set; }

    public DateTime? EndedAt { get; set; }

    public DateTime? DeletedAt { get; set; }

    public DateTime? WarmUpStartedAt { get; set; }

    public DateTime? WarmUpEndedAt { get; set; }

    public uint? WarmUpDuration { get; set; }

    public virtual SessionExercise SessionExercise { get; set; } = null!;
}
