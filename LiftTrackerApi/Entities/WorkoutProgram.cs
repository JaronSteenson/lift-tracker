namespace LiftTrackerApi.Entities;

public partial class WorkoutProgram
{
    public string? Name { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public Guid Uuid { get; set; }

    public int? UserId { get; set; }

    public int Id { get; }

    public DateTime? DeletedAt { get; set; }

    public virtual ICollection<WorkoutProgramRoutine> WorkoutProgramRoutines { get; set; } = new List<WorkoutProgramRoutine>();
}
