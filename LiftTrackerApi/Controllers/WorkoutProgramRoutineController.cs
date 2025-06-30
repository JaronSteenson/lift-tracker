using System.Security.Claims;
using LiftTrackerApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace LiftTrackerApi.Controllers;

public class WorkoutProgramRoutineController(WorkoutProgramService workoutProgramService)
    : Controller
{
    public async Task<IActionResult> Index()
    {
        var userId = int.Parse(
            HttpContext
                .User?.Claims?.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)
                ?.Value ?? "-1"
        );

        var routines = await workoutProgramService.FindRoutinesForUserId(userId);

        return Json(routines);
    }
}
