using System.Diagnostics;

namespace LiftTrackerApi.Middleware;

using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

public class JsonExceptionMiddleware(
    RequestDelegate next,
    ILogger<JsonExceptionMiddleware> logger,
    IConfiguration configuration
)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context); // call next middleware
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception occurred.");
            await HandleExceptionAsync(context, ex);
        }
    }

    private Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        var result = JsonSerializer.Serialize(
            new
            {
                error = "An unexpected error occurred.",
                requestId = Activity.Current?.Id ?? context.TraceIdentifier,
                detail = configuration.GetValue<bool>("ShowExceptionMessageInResponse")
                    ? exception.Message
                    : "Please try again later.",
            }
        );

        return context.Response.WriteAsync(result);
    }
}
