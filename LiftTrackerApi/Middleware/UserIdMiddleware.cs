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
        var emailVerified = context
            .User?.Claims.FirstOrDefault(c => c.Type == EmailVerifiedClaim)
            ?.Value;
        if (emailVerified != "true")
        {
            throw new UnauthorizedAccessException("Email not verified.");
        }

        var email = context.User?.Claims.FirstOrDefault(c => c.Type == EmailClaim)?.Value;
        if (!MailAddress.TryCreate(email ?? String.Empty, out _))
        {
            throw new UnauthorizedAccessException("Invalid email address.");
        }

        var user = await db.Users.Where(user => user.Email == email).FirstOrDefaultAsync();
        if (user == null)
        {
            user = new User { Uuid = Guid.NewGuid(), Email = email };
            db.Users.Add(user);
            await db.SaveChangesAsync();
        }

        context.Items["UserId"] = user.Id;
        await next(context);
    }
}
