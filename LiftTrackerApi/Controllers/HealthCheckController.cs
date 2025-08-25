using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LiftTrackerApi.Controllers;

[ApiController]
[AllowAnonymous]
[Route("/api")]
public class HealthCheckController : Controller
{
    [HttpGet]
    public JsonResult Index()
    {
        var userId = (int)(HttpContext.Items["UserId"] ?? -1);

        return Json(
            new HealthResponse
            {
                Message = "Service is available",
                UserId = userId,
                Timestamp = DateTime.UtcNow,
            }
        );
    }
}

public class HealthResponse
{
    public string Message { get; set; } = string.Empty;
    public int UserId { get; set; }
    public DateTime Timestamp { get; set; }
}
