using LiftTrackerApi.Entities;
using LiftTrackerApi.Exceptions;
using LiftTrackerApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace LiftTrackerApi.Controllers;

public class WorkoutProgramController(WorkoutProgramService workoutProgramService) : Controller
{
    public async Task<IActionResult> Index(Guid? routineUuid)
    {
        var userId = (int)(HttpContext.Items["UserId"] ?? -1);

        if (routineUuid != null)
        {
            var workoutProgram = await workoutProgramService.FindWorkoutProgramByRoutineUuid(
                userId,
                routineUuid.Value
            );
            return Json(workoutProgram);
        }

        var workoutPrograms = await workoutProgramService.FindWorkoutProgramsForUserId(userId);
        return Json(workoutPrograms);
    }

    [HttpPost]
    public async Task<IActionResult> Index([FromBody] WorkoutProgram workoutProgram)
    {
        var userId = (int)(HttpContext.Items["UserId"] ?? -1);

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var created = await workoutProgramService.CreateWithChildren(workoutProgram, userId);
        return Json(created);
    }
}
