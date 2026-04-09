using System.ComponentModel.DataAnnotations;

// ReSharper disable CollectionNeverUpdated.Global
// ReSharper disable AutoPropertyCanBeMadeGetOnly.Global
// ReSharper disable UnusedAutoPropertyAccessor.Global
namespace LiftTrackerApi.Dtos;

public class WorkoutSessionDto
{
    public Guid? Uuid { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    [Required(ErrorMessage = "Name is required")]
    [StringLength(
        100,
        MinimumLength = 1,
        ErrorMessage = "Name must be between 1 and 100 characters"
    )]
    public string? Name { get; set; }

    public DateTime? StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }

    [StringLength(maximumLength: 1000, ErrorMessage = "Notes must not exceed 1000 characters")]
    public string? Notes { get; set; }

    public decimal? BodyWeight { get; set; }
    public Guid? WorkoutProgramRoutineUuid { get; set; }
    public string? WorkoutProgramRoutineName { get; set; }
    public Guid? WorkoutProgramUuid { get; set; }
    public string? WorkoutProgramName { get; set; }
    public List<SessionExerciseDto> SessionExercises { get; set; } = [];
}
