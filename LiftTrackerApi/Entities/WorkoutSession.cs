namespace LiftTrackerApi.Entities;

public partial class WorkoutSession
{
    public uint Id { get; set; }

    public Guid Uuid { get; set; }

    public uint? WorkoutProgramRoutineId { get; set; }

    public uint? UserId { get; set; }

    public string? Name { get; set; }

    public DateTime? StartedAt { get; set; }

    public DateTime? EndedAt { get; set; }

    public string? Notes { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }

    public decimal? BodyWeight { get; set; }

    public virtual ICollection<SessionExercise> SessionExercises { get; set; } = new List<SessionExercise>();
}
