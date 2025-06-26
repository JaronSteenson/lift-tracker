namespace LiftTrackerApi.Entities;

public partial class WorkoutProgram : DomainEntity
{
    public string? Name { get; set; }

    public int? UserId { get; set; }

    public DateTime? DeletedAt { get; set; }

    public virtual ICollection<WorkoutProgramRoutine> WorkoutProgramRoutines { get; set; } =
        new List<WorkoutProgramRoutine>();
}
