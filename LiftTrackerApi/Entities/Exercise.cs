using System.Text.Json.Serialization;
using LiftTrackerApi.Entities.Interfaces;

namespace LiftTrackerApi.Entities;

public partial class Exercise : DomainEntity, IOwnable
{
    public string Name { get; set; } = null!;

    [JsonIgnore]
    public int? UserId { get; set; }
}
