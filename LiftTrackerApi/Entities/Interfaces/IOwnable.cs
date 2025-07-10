namespace LiftTrackerApi.Entities.Interfaces;

public interface IOwnable
{
    /// <summary>
    /// A user may own some top level entities (and by proxy their children).
    /// </summary>
    public int? UserId { get; set; }
}
