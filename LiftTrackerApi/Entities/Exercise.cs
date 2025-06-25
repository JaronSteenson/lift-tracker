namespace LiftTrackerApi.Entities;

public partial class Exercise : DomainEntity
{
    public string Name { get; set; } = null!;

    public int? UserId { get; set; }
}
