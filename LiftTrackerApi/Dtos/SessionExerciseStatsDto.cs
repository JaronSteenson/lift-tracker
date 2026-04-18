using System.ComponentModel.DataAnnotations;

// ReSharper disable CollectionNeverUpdated.Global
// ReSharper disable AutoPropertyCanBeMadeGetOnly.Global
// ReSharper disable UnusedAutoPropertyAccessor.Global
// ReSharper disable PropertyCanBeMadeInitOnly.Global
namespace LiftTrackerApi.Dtos;

public class SessionExerciseStatsDto
{
    public Guid? Uuid { get; set; }
    public Guid? WorkoutSessionUuid { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    [StringLength(
        1000,
        MinimumLength = 1,
        ErrorMessage = "Name must be between 1 and 1000 characters"
    )]
    public string Name { get; set; } = null!;

    public decimal? PlannedWeight { get; set; }
    public int? PlannedRpe { get; set; }
    public int? PlannedRestPeriodDuration { get; set; }

    [StringLength(maximumLength: 1000, ErrorMessage = "Notes must not exceed 1000 characters")]
    public string? Notes { get; set; }

    public int Position { get; set; }
    public bool Skipped { get; set; }
    public int? PlannedWarmUp { get; set; }
    public DateTime? WarmUpStartedAt { get; set; }
    public DateTime? WarmUpEndedAt { get; set; }
    public int? WarmUpDuration { get; set; }
    public Guid? RoutineExerciseUuid { get; set; }
    public decimal? BodyWeight { get; set; }
    public List<SessionSetDto> SessionSets { get; set; } = [];
}
