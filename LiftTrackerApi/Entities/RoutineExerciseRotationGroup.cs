using System.Text.Json.Serialization;

namespace LiftTrackerApi.Entities;

public class RoutineExerciseRotationGroup : DomainEntity
{
    public int NextExerciseIndex { get; set; }

    public int? WorkoutProgramRoutineId { get; set; }

    [JsonIgnore]
    public virtual WorkoutProgramRoutine? WorkoutProgramRoutine { get; set; }

    [JsonIgnore]
    public virtual ICollection<RoutineExercise> RoutineExercises { get; set; } =
        new List<RoutineExercise>();
}
