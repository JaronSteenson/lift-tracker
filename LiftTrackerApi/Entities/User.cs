namespace LiftTrackerApi.Entities;

public partial class User
{
    public int Id { get; set; }

    public string? FirstName { get; set; }

    public string? LastName { get; set; }

    public string? Email { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? EmailVerifiedAt { get; set; }

    public string Password { get; set; } = null!;

    public string? RememberToken { get; set; }
}
