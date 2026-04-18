// ReSharper disable CollectionNeverUpdated.Global
// ReSharper disable AutoPropertyCanBeMadeGetOnly.Global
// ReSharper disable UnusedAutoPropertyAccessor.Global
// ReSharper disable PropertyCanBeMadeInitOnly.Global
namespace LiftTrackerApi.Dtos;

public class ExerciseCycleProjectionWeekDto
{
    public int Week { get; set; }
    public string Label { get; set; } = null!;
    public List<ExerciseCycleProjectionSetDto> Sets { get; set; } = [];
}
