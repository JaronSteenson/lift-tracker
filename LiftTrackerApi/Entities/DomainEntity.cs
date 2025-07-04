using System.ComponentModel;

namespace LiftTrackerApi.Entities;

public abstract class DomainEntity
{
    public int? Id { get; set; }

    public Guid? Uuid { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }
}
