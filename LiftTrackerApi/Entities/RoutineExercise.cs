using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using LiftTrackerApi.Entities.Interfaces;

namespace LiftTrackerApi.Entities;

public partial class RoutineExercise : DomainEntity, IPositionable, IValidatableObject
{
    [MaxLength(100, ErrorMessage = "Name must be at most 100 characters")]
    public string? Name { get; set; }

    public int? NumberOfSets { get; set; }

    public ProgressionScheme? ProgressionScheme { get; set; }

    public ProgressionScheme531Settings? ProgressionSchemeSettings { get; set; }

    [JsonIgnore]
    public int? RoutineExerciseRotationGroupId { get; set; }

    public int? RotationGroupPosition { get; set; }

    [NotMapped]
    public Guid? RotationGroupUuid { get; set; }

    public int? WorkoutProgramRoutineId { get; set; }

    /// <inheritdoc/>
    public int Position { get; set; }

    public decimal? Weight { get; set; }

    [Range(1, 10, ErrorMessage = "RPE must be between 1 and 10")]
    public int? Rpe { get; set; }

    public int? RestPeriod { get; set; }

    public int? WarmUp { get; set; }

    public virtual WorkoutProgramRoutine? WorkoutProgramRoutine { get; set; }

    [JsonIgnore]
    public virtual RoutineExerciseRotationGroup? RoutineExerciseRotationGroup { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        return ProgressionSchemeValidation.ValidateRoutineExercise(
            ProgressionScheme,
            ProgressionSchemeSettings
        );
    }
}
