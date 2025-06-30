using System.Security.Claims;

namespace LiftTrackerApi.Middleware;

/**
 * Temp/test middleware till auth zero is added last.
 */
public class UserIdMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var userIdClaim = context
            .User?.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)
            ?.Value;

        if (int.TryParse(userIdClaim, out int userId))
        {
            context.Items["UserId"] = userId;
        }

        await next(context);
    }
}
