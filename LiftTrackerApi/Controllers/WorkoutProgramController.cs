using System.Security.Claims;
using LiftTrackerApi.Entities;
using LiftTrackerApi.Extensions;
using LiftTrackerApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LiftTrackerApi.Controllers;

public class WorkoutProgramController(WorkoutProgramService workoutProgramService) : Controller
{
    public async Task<IActionResult> Index(Guid? routineUuid)
    {
        var userId = int.Parse(
            HttpContext
                .User?.Claims?.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)
                ?.Value ?? "-1"
        );

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
}
