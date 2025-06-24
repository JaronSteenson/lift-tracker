namespace LiftTrackerApi.Entities;

public partial class WorkoutProgramRoutine
{
    public Guid Uuid { get; set; }

    public string? Name { get; set; }

    public string? NormalDay { get; set; }

    public int? WorkoutProgramId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int Position { get; set; }

    public int Id { get; }

    public DateTime? DeletedAt { get; set; }

    public virtual ICollection<RoutineExercise> RoutineExercises { get; set; } = new List<RoutineExercise>();

    public virtual WorkoutProgram? WorkoutProgram { get; set; }
}
