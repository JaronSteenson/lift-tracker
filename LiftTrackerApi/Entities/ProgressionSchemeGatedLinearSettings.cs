using System.ComponentModel.DataAnnotations;

namespace LiftTrackerApi.Entities;

public class ProgressionSchemeGatedLinearSettings : ProgressionSchemeSettings
{
    [Required(ErrorMessage = "Successful workouts required is required")]
    [Range(1, int.MaxValue, ErrorMessage = "Successful workouts required must be at least 1")]
    public int? RequiredSuccessStreak { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "Current success streak cannot be negative")]
    public int CurrentSuccessStreak { get; set; }

    [Range(1, 10, ErrorMessage = "Max RPE must be between 1 and 10")]
    public int? TargetRpe { get; set; }

    [Range(
        typeof(decimal),
        "0.01",
        "79228162514264337593543950335",
        ErrorMessage = "Min reps must be greater than 0"
    )]
    public decimal? TargetReps { get; set; }

    public bool UseWeightGate { get; set; }

    [Required(ErrorMessage = "Increment by is required")]
    [Range(
        typeof(decimal),
        "0.01",
        "79228162514264337593543950335",
        ErrorMessage = "Increment by must be greater than 0"
    )]
    public decimal? IncrementBy { get; set; }

    public override ProgressionSchemeSettings Clone()
    {
        return new ProgressionSchemeGatedLinearSettings
        {
            RequiredSuccessStreak = RequiredSuccessStreak,
            CurrentSuccessStreak = CurrentSuccessStreak,
            TargetRpe = TargetRpe,
            TargetReps = TargetReps,
            UseWeightGate = UseWeightGate,
            IncrementBy = IncrementBy,
        };
    }
}
