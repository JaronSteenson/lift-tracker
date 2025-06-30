using System.Diagnostics;
using LiftTrackerApi.Exceptions;

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

        if (exception is UuidAlreadyExistsException)
        {
            context.Response.StatusCode = 400; // Bad Request
            return context.Response.WriteAsync(
                JsonSerializer.Serialize(
                    new
                    {
                        error = "An unexpected error occurred.",
                        requestId = Activity.Current?.Id ?? context.TraceIdentifier,
                        detail = exception.Message,
                    }
                )
            );
        }

        return context.Response.WriteAsync(
            JsonSerializer.Serialize(
                new
                {
                    error = "An unexpected error occurred.",
                    requestId = Activity.Current?.Id ?? context.TraceIdentifier,
                    detail = configuration.GetValue<bool>("ShowExceptionMessageInResponse")
                        ? exception.Message
                        : "Please try again later.",
                }
            )
        );
    }
}
