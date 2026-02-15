using System.ComponentModel.DataAnnotations;
using LiftTrackerApi.Entities.Interfaces;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace LiftTrackerApi.Entities;

public partial class SessionExercise : DomainEntity, IPositionable
{
    [Required]
    [StringLength(
        1000,
        MinimumLength = 1,
        ErrorMessage = "Name must be between 1 and 1000 characters"
    )]
    public string Name { get; set; } = null!;

    public decimal? PlannedWeight { get; set; }

    public int? PlannedRestPeriodDuration { get; set; }

    [StringLength(maximumLength: 1000, ErrorMessage = "Notes must not exceed 1000 characters")]
    public string? Notes { get; set; }

    /// <inheritdoc/>
    public int Position { get; set; }

    public bool Skipped { get; set; }

    public int? PlannedWarmUp { get; set; }

    public DateTime? WarmUpStartedAt { get; set; }

    public DateTime? WarmUpEndedAt { get; set; }

    public int? WarmUpDuration { get; set; }

    public virtual ICollection<SessionSet> SessionSets { get; set; } = new List<SessionSet>();

    [ValidateNever]
    public virtual WorkoutSession WorkoutSession { get; set; } = null!;

    [ValidateNever]
    public virtual RoutineExercise? RoutineExercise { get; set; }
}
