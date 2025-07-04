using LiftTrackerApi.Entities;
using LiftTrackerApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace LiftTrackerApi.Controllers;

[ApiController]
[Route("/session-sets")]
public class SessionSetController(WorkoutSessionService workoutSessionService) : Controller
{
    [HttpPut]
    public async Task<IActionResult> Update([FromBody] SessionSet sessionSet)
    {
        var userId = (int)(HttpContext.Items["UserId"] ?? -1);

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var updated = await workoutSessionService.UpdateSet(sessionSet, userId);
        return Json(updated);
    }
}
