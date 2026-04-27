using System.Diagnostics;
using LiftTrackerApi.Exceptions;

namespace LiftTrackerApi.Middleware;

using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Rollbar;

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
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception occurred.");
            ReportUnexpectedExceptionToRollbar(context, ex);
            await HandleExceptionAsync(context, ex);
        }
    }

    private void ReportUnexpectedExceptionToRollbar(HttpContext context, Exception exception)
    {
        if (
            !ShouldReportToRollbar(exception)
            || !RollbarInfrastructure.Instance.IsInitialized
            || string.IsNullOrWhiteSpace(configuration["Rollbar:AccessToken"])
        )
        {
            return;
        }

        try
        {
            var custom = new Dictionary<string, object?>
            {
                ["requestMethod"] = context.Request.Method,
                ["requestPath"] = context.Request.Path.ToString(),
                ["queryString"] = context.Request.QueryString.ToString(),
                ["statusCode"] = (int)HttpStatusCode.InternalServerError,
                ["traceIdentifier"] = context.TraceIdentifier,
            };

            if (context.Items.TryGetValue("UserId", out var userId) && userId != null)
            {
                custom["userId"] = userId;
            }

            RollbarLocator.RollbarInstance.Error(exception, custom);
        }
        catch (Exception rollbarException)
        {
            logger.LogWarning(rollbarException, "Failed to report exception to Rollbar.");
        }
    }

    private static bool ShouldReportToRollbar(Exception exception) =>
        exception
            is not UuidAlreadyExistsException
                and not UnauthorizedAccessException
                and not NotFoundException;

    private Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        switch (exception)
        {
            case UuidAlreadyExistsException:
                context.Response.StatusCode = 400; // Bad Request
                return context.Response.WriteAsync(
                    JsonSerializer.Serialize(
                        new
                        {
                            error = "Uuid already assigned.",
                            requestId = Activity.Current?.Id ?? context.TraceIdentifier,
                            detail = exception.Message,
                        }
                    )
                );
            case UnauthorizedAccessException:
                context.Response.StatusCode = 401; // Unauthorized
                return context.Response.WriteAsync(
                    JsonSerializer.Serialize(
                        new
                        {
                            error = "Unauthorized.",
                            requestId = Activity.Current?.Id ?? context.TraceIdentifier,
                            detail = exception.Message,
                        }
                    )
                );
            case NotFoundException:
                context.Response.StatusCode = 404; // Not found
                return context.Response.WriteAsync(
                    JsonSerializer.Serialize(
                        new
                        {
                            error = "Entity not found.",
                            requestId = Activity.Current?.Id ?? context.TraceIdentifier,
                            detail = exception.Message,
                        }
                    )
                );
            default:
                return context.Response.WriteAsync(
                    JsonSerializer.Serialize(
                        new
                        {
                            error = "An unexpected error occurred.",
                            requestId = Activity.Current?.Id ?? context.TraceIdentifier,
                            detail = configuration.GetValue<bool>("ShowExceptionMessageInResponse")
                                ? exception?.InnerException?.Message ?? exception?.Message
                                : "Please try again later.",
                        }
                    )
                );
        }
    }
}
