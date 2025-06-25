namespace LiftTrackerApi.Entities;

public partial class RoutineExercise : DomainEntity
{
    public int Id { get; }

    public Guid Uuid { get; set; }

    public string? Name { get; set; }

    public int? NumberOfSets { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? WorkoutProgramRoutineId { get; set; }

    public int Position { get; set; }

    public decimal? Weight { get; set; }

    public int? RestPeriod { get; set; }

    public DateTime? DeletedAt { get; set; }

    public int? WarmUp { get; set; }

    public virtual WorkoutProgramRoutine? WorkoutProgramRoutine { get; set; }
}
