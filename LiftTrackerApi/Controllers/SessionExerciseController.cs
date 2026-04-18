using LiftTrackerApi.Dtos;
using LiftTrackerApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace LiftTrackerApi.Controllers;

[ApiController]
[Route("/api/session-exercises")]
public class SessionExerciseController(WorkoutSessionService workoutSessionService) : Controller
{
    [HttpPut]
    public async Task<IActionResult> Update([FromBody] SessionExerciseDto sessionExercise)
    {
        var userId = (int)(HttpContext.Items["UserId"] ?? -1);
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var updated = await workoutSessionService.UpdateWithChildren(sessionExercise, userId);
        return Json(WorkoutSessionDtoMapper.ToDto(updated));
    }

    [HttpGet("history/{sourceSessionSetUuid:guid}")]
    public async Task<IActionResult> GetHistory(
        Guid sourceSessionSetUuid,
        [FromQuery] int pageIndex = 1,
        [FromQuery] int pageSize = 10
    )
    {
        var userId = (int)(HttpContext.Items["UserId"] ?? -1);
        var history = await workoutSessionService.GetExerciseHistory(
            sourceSessionSetUuid,
            userId,
            pageIndex,
            pageSize
        );
        return Json(WorkoutSessionDtoMapper.ToStatsDto(history));
    }
}
