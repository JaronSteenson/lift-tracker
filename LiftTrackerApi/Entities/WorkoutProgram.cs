using System.ComponentModel.DataAnnotations;

namespace LiftTrackerApi.Entities;

public partial class WorkoutProgram : DomainEntity
{
    [Required(ErrorMessage = "Name is required")]
    [StringLength(
        100,
        MinimumLength = 1,
        ErrorMessage = "Name must be between 1 and 100 characters"
    )]
    public string? Name { get; set; }

    public int? UserId { get; set; }

    public virtual ICollection<WorkoutProgramRoutine> WorkoutProgramRoutines { get; set; } =
        new List<WorkoutProgramRoutine>();
}
