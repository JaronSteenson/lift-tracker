namespace LiftTrackerApi.Entities;

public partial class User : DomainEntity
{
    // ReSharper disable once EntityFramework.ModelValidation.UnlimitedStringLength
    public string? Email { get; set; }
}
