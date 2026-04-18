using System.ComponentModel.DataAnnotations;

// ReSharper disable CollectionNeverUpdated.Global
// ReSharper disable AutoPropertyCanBeMadeGetOnly.Global
// ReSharper disable UnusedAutoPropertyAccessor.Global
// ReSharper disable PropertyCanBeMadeInitOnly.Global
namespace LiftTrackerApi.Dtos;

public class StartWorkoutRequestDto
{
    [Required(ErrorMessage = "Routine UUID is required")]
    public Guid? RoutineUuid { get; set; }
}
