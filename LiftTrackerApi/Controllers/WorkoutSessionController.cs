using LiftTrackerApi.Entities;
using LiftTrackerApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace LiftTrackerApi.Controllers;

[ApiController]
[Route("/workout-sessions")]
public class WorkoutSessionController(WorkoutSessionService workoutSessionService) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index(
        [FromQuery] int pageIndex = 1,
        [FromQuery] int pageSize = 10
    )
    {
        var userId = (int)(HttpContext.Items["UserId"] ?? -1);

        var workoutSessions = await workoutSessionService.FindWorkoutSessionsForUserId(
            userId,
            pageIndex,
            pageSize
        );
        return Json(workoutSessions);
    }

    [HttpGet("{uuid:guid}")]
    public async Task<IActionResult> Get(Guid uuid)
    {
        var userId = (int)(HttpContext.Items["UserId"] ?? -1);

        var workoutSession = await workoutSessionService.FindByUuidAndOwner(uuid, userId);
        return Json(workoutSession);
    }

    [HttpGet("by-set/{sessionSetUuid:guid}")]
    public async Task<IActionResult> GetBySessionSet(Guid sessionSetUuid)
    {
        var userId = (int)(HttpContext.Items["UserId"] ?? -1);

        var workoutSession = await workoutSessionService.FindBySessionSetAndOwner(
            sessionSetUuid,
            userId
        );
        return Json(workoutSession);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] WorkoutSession workoutSession)
    {
        var userId = (int)(HttpContext.Items["UserId"] ?? -1);

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var created = await workoutSessionService.CreateWithChildren(workoutSession, userId);
        return Json(created);
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] WorkoutSession workoutSession)
    {
        var userId = (int)(HttpContext.Items["UserId"] ?? -1);

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var updated = await workoutSessionService.UpdateWithChildren(workoutSession, userId);
        return Json(updated);
    }

    [HttpDelete("{uuid:guid}")]
    public async Task Delete(Guid uuid)
    {
        var userId = (int)(HttpContext.Items["UserId"] ?? -1);

        await workoutSessionService.DeleteWorkoutSession(uuid, userId);
    }
}
