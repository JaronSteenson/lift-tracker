using System.ComponentModel.DataAnnotations;

namespace LiftTrackerApi.Entities;

public class ProgressionScheme531Settings
{
    [Range(1, 4, ErrorMessage = "Current cycle week must be between 1 and 4")]
    public int? CurrentCycleWeek { get; set; }

    [Required(ErrorMessage = "531 body type is required")]
    public ProgressionScheme531BodyType? BodyType { get; set; }
}
