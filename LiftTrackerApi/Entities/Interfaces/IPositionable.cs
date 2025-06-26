namespace LiftTrackerApi.Entities.Interfaces;

public interface IPositionable
{
    /// <summary>
    /// Either the display order and/or the chronological order that the entity will be interacted with in the UI.
    /// </summary>
    public int Position { get; set; }
}
