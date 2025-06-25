namespace LiftTrackerApi.Entities;

public partial class WorkoutSession : DomainEntity
{

    public int? WorkoutProgramRoutineId { get; set; }

    public int? UserId { get; set; }

    public string? Name { get; set; }

    public DateTime? StartedAt { get; set; }

    public DateTime? EndedAt { get; set; }

    public string? Notes { get; set; }

    public decimal? BodyWeight { get; set; }

    public virtual ICollection<SessionExercise> SessionExercises { get; set; } = new List<SessionExercise>();
}
