using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace LiftTrackerApi.Entities;

public partial class WorkoutSession : DomainEntity
{
    public int? UserId { get; set; }

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

    public virtual ICollection<SessionExercise> SessionExercises { get; set; } =
        new List<SessionExercise>();

    [ValidateNever]
    public virtual WorkoutProgramRoutine? WorkoutProgramRoutine { get; set; }
}
