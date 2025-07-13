using System.Security.Claims;
using LiftTrackerApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace LiftTrackerApi.Controllers;

[ApiController]
[Route("/api/routines")]
public class WorkoutProgramRoutineController(WorkoutProgramService workoutProgramService)
    : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index()
    {
        var userId = (int)(HttpContext.Items["UserId"] ?? -1);

        var routines = await workoutProgramService.FindRoutinesForUserId(userId);

        return Json(routines);
    }
}
