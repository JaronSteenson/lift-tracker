using LiftTrackerApi.Entities;
using LiftTrackerApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace LiftTrackerApi.Controllers;

[ApiController]
[Route("/api/workout-programs")]
public class WorkoutProgramController(WorkoutProgramService workoutProgramService) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index()
    {
        var userId = (int)(HttpContext.Items["UserId"] ?? -1);

        var workoutPrograms = await workoutProgramService.FindWorkoutProgramsForUserId(userId);
        return Json(workoutPrograms);
    }

    [HttpGet("{uuid:guid}")]
    public async Task<IActionResult> Get(Guid uuid)
    {
        var userId = (int)(HttpContext.Items["UserId"] ?? -1);

        var workoutProgram = await workoutProgramService.FindByUuidAndOwner(uuid, userId);
        return Json(workoutProgram);
    }

    [HttpGet("by-routine/{routineUuid:guid}")]
    public async Task<IActionResult> GetByRoutineUuid(Guid routineUuid)
    {
        var userId = (int)(HttpContext.Items["UserId"] ?? -1);

        var workoutProgram = await workoutProgramService.FindWorkoutProgramByRoutineUuid(
            routineUuid,
            userId
        );
        return Json(workoutProgram);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] WorkoutProgram workoutProgram)
    {
        var userId = (int)(HttpContext.Items["UserId"] ?? -1);

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var created = await workoutProgramService.CreateWithChildren(workoutProgram, userId);
        return Json(created);
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] WorkoutProgram workoutProgram)
    {
        var userId = (int)(HttpContext.Items["UserId"] ?? -1);

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var updated = await workoutProgramService.UpdateWithChildren(workoutProgram, userId);
        return Json(updated);
    }

    [HttpDelete("{uuid:guid}")]
    public async Task Delete(Guid uuid)
    {
        var userId = (int)(HttpContext.Items["UserId"] ?? -1);

        await workoutProgramService.DeleteWorkoutProgram(uuid, userId);
    }
}
