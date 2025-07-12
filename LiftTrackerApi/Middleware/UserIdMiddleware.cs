using System.Net.Mail;
using System.Security.Claims;
using LiftTrackerApi.Entities;
using Microsoft.EntityFrameworkCore;

namespace LiftTrackerApi.Middleware;

/**
 * Maps the email provided from auth0 to a user in the database.
 */
public class UserIdMiddleware(RequestDelegate next)
{
    public static readonly String EmailClaim = "https://lift-tracker.app/email";
    public static readonly String EmailVerifiedClaim = "https://lift-tracker.app/email_verified";

    public async Task InvokeAsync(HttpContext context, LiftTrackerDbContext db)
    {
        // Skip for root/health check.
        var path = context.Request.Path.Value ?? "";
        if (path.Equals("/", StringComparison.OrdinalIgnoreCase))
        {
            await next(context);
            return;
        }

        var email = context.User?.Claims.FirstOrDefault(c => c.Type == EmailClaim);
        var emailVerified = context.User?.Claims.FirstOrDefault(c => c.Type == EmailVerifiedClaim);
        if (email == null || emailVerified == null)
        {
            throw new UnauthorizedAccessException("Invalid or missing JWT.");
        }

        if (emailVerified.Value != "true")
        {
            throw new UnauthorizedAccessException("Email not verified.");
        }

        if (!MailAddress.TryCreate(email.Value, out _))
        {
            throw new UnauthorizedAccessException($"Invalid email address {email.Value}.");
        }

        var user = await db.Users.Where(user => user.Email == email.Value).FirstOrDefaultAsync();
        if (user == null)
        {
            user = new User { Uuid = Guid.NewGuid(), Email = email.Value };
            db.Users.Add(user);
            await db.SaveChangesAsync();
        }

        context.Items["UserId"] = user.Id;
        await next(context);
    }
}
