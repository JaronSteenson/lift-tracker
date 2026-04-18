using LiftTrackerApi.Entities;

// ReSharper disable CollectionNeverUpdated.Global
// ReSharper disable AutoPropertyCanBeMadeGetOnly.Global
// ReSharper disable UnusedAutoPropertyAccessor.Global
// ReSharper disable PropertyCanBeMadeInitOnly.Global
namespace LiftTrackerApi.Dtos;

public class ExerciseCycleProjectionSetDto
{
    public int Position { get; set; }
    public decimal? Weight { get; set; }
    public decimal? Percentage { get; set; }
    public decimal? Reps { get; set; }
    public bool IsAmrap { get; set; }
}
