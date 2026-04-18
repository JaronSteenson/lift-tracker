using LiftTrackerApi.Entities;

// ReSharper disable CollectionNeverUpdated.Global
// ReSharper disable AutoPropertyCanBeMadeGetOnly.Global
// ReSharper disable UnusedAutoPropertyAccessor.Global
// ReSharper disable PropertyCanBeMadeInitOnly.Global
namespace LiftTrackerApi.Dtos;

public class ExerciseCycleProjectionDto
{
    public Guid? ExerciseUuid { get; set; }
    public ProgressionScheme? ProgressionScheme { get; set; }
    public List<ExerciseCycleProjectionWeekDto> Weeks { get; set; } = [];
}
