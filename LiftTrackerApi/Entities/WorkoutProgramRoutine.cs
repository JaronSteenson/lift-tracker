namespace LiftTrackerApi.Entities;

public partial class WorkoutProgramRoutine : DomainEntity
{
    public string? Name { get; set; }

    public string? NormalDay { get; set; }

    public int? WorkoutProgramId { get; set; }

    public int Position { get; set; }

    public virtual ICollection<RoutineExercise> RoutineExercises { get; set; } = new List<RoutineExercise>();

    public virtual WorkoutProgram? WorkoutProgram { get; set; }
}
