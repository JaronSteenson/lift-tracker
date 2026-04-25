using LiftTrackerApi.Dtos;
using LiftTrackerApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace LiftTrackerApi.Controllers;

[ApiController]
[Route("/api/workout-sessions")]
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
        return Json(WorkoutSessionDtoMapper.ToDto(workoutSessions));
    }

    [HttpGet("in-progress")]
    public async Task<IActionResult> GetInProgress()
    {
        var userId = (int)(HttpContext.Items["UserId"] ?? -1);

        var workoutSession = await workoutSessionService.FindInProgressForOwner(userId);
        return Json(workoutSession == null ? null : WorkoutSessionDtoMapper.ToDto(workoutSession));
    }

    [HttpGet("{uuid:guid}")]
    public async Task<IActionResult> Get(Guid uuid)
    {
        var userId = (int)(HttpContext.Items["UserId"] ?? -1);

        var workoutSession = await workoutSessionService.FindByUuidAndOwner(uuid, userId);
        return Json(WorkoutSessionDtoMapper.ToDto(workoutSession));
    }

    [HttpGet("by-set/{sessionSetUuid:guid}")]
    public async Task<IActionResult> GetBySessionSet(Guid sessionSetUuid)
    {
        var userId = (int)(HttpContext.Items["UserId"] ?? -1);

        var workoutSession = await workoutSessionService.FindBySessionSetAndOwner(
            sessionSetUuid,
            userId
        );
        return Json(WorkoutSessionDtoMapper.ToDto(workoutSession));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] WorkoutSessionDto workoutSession)
    {
        var userId = (int)(HttpContext.Items["UserId"] ?? -1);

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var created = await workoutSessionService.CreateWithChildren(workoutSession, userId);
        return Json(WorkoutSessionDtoMapper.ToDto(created));
    }

    [HttpPost("start")]
    public async Task<IActionResult> Start([FromBody] StartWorkoutRequestDto request)
    {
        var userId = (int)(HttpContext.Items["UserId"] ?? -1);

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var started = await workoutSessionService.StartWorkout(request, userId);
            return Json(WorkoutSessionDtoMapper.ToDto(started));
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { error = exception.Message });
        }
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] WorkoutSessionDto workoutSession)
    {
        var userId = (int)(HttpContext.Items["UserId"] ?? -1);

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var updated = await workoutSessionService.UpdateWithChildren(workoutSession, userId);
            return Json(WorkoutSessionDtoMapper.ToDto(updated));
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { error = exception.Message });
        }
    }

    [HttpDelete("{uuid:guid}")]
    public async Task Delete(Guid uuid)
    {
        var userId = (int)(HttpContext.Items["UserId"] ?? -1);

        await workoutSessionService.DeleteWorkoutSession(uuid, userId);
    }
}
