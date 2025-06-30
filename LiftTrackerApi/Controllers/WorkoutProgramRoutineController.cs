using System.Security.Claims;
using LiftTrackerApi.Entities;
using LiftTrackerApi.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LiftTrackerApi.Controllers;

public class WorkoutProgramRoutineController(LiftTrackerDbContext db) : Controller
{
    public async Task<IActionResult> Index()
    {
        var userId = int.Parse(
            HttpContext
                .User?.Claims?.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)
                ?.Value ?? "-1"
        );

        var query = db
            .WorkoutProgramRoutines.Include(routine => routine.WorkoutProgram)
            .Include(routine => routine.RoutineExercises)
            .Where(routine =>
                routine.WorkoutProgram != null && routine.WorkoutProgram.UserId == userId
            )
            // Ordered by last "touched" rather than position, so that most recently used or updated are shown first.
            .OrderByDescending(routine => routine.UpdatedAt ?? routine.CreatedAt);

        var routines = await query.ToListAsync();
        SortChildren(routines);

        return Json(routines);
    }

    private void SortChildren(List<WorkoutProgramRoutine> workoutProgramRoutines)
    {
        foreach (var workoutProgramRoutine in workoutProgramRoutines)
            workoutProgramRoutine.RoutineExercises = workoutProgramRoutine
                .RoutineExercises.OrderByPosition()
                .ToList();
    }
}
