using System.ComponentModel.DataAnnotations;

namespace LiftTrackerApi.Entities;

public class ProgressionScheme531Settings : ProgressionSchemeSettings
{
    [Range(1, 4, ErrorMessage = "Current cycle week must be between 1 and 4")]
    public int? CurrentCycleWeek { get; set; }

    [Required(ErrorMessage = "531 body type is required")]
    public ProgressionScheme531BodyType? BodyType { get; set; }

    public override ProgressionSchemeSettings Clone()
    {
        return new ProgressionScheme531Settings
        {
            CurrentCycleWeek = CurrentCycleWeek,
            BodyType = BodyType,
        };
    }
}
