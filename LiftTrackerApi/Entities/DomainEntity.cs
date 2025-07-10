using System.ComponentModel;
using System.Text.Json.Serialization;

namespace LiftTrackerApi.Entities;

public abstract class DomainEntity
{
    [JsonIgnore]
    public int? Id { get; set; }

    public Guid? Uuid { get; set; }

    public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    [JsonIgnore]
    public DateTime? DeletedAt { get; set; }
}
