using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using LiftTrackerApi.Entities.Interfaces;

namespace LiftTrackerApi.Entities;

public partial class WorkoutProgram : DomainEntity, IOwnable
{
    [MaxLength(100, ErrorMessage = "Name must be at most 100 characters")]
    public string? Name { get; set; }

    [JsonIgnore]
    public int? UserId { get; set; }

    public virtual ICollection<WorkoutProgramRoutine> WorkoutProgramRoutines { get; set; } =
        new List<WorkoutProgramRoutine>();
}
