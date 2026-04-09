// ReSharper disable CollectionNeverUpdated.Global
// ReSharper disable AutoPropertyCanBeMadeGetOnly.Global
// ReSharper disable UnusedAutoPropertyAccessor.Global
namespace LiftTrackerApi.Dtos;

public class SessionSetDto
{
    public Guid? Uuid { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public decimal? Reps { get; set; }
    public decimal? Weight { get; set; }
    public int? RestPeriodDuration { get; set; }
    public DateTime? RestPeriodStartedAt { get; set; }
    public DateTime? RestPeriodEndedAt { get; set; }
    public int Position { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public DateTime? WarmUpStartedAt { get; set; }
    public DateTime? WarmUpEndedAt { get; set; }
    public int? WarmUpDuration { get; set; }
}
