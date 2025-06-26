using System.Diagnostics;
using System.Security.Claims;
using LiftTrackerApi.Entities;
using LiftTrackerApi.Extensions;
using LiftTrackerApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LiftTrackerApi.Controllers;

public class WorkoutProgramController(
    ILogger<WorkoutProgramController> logger,
    LiftTrackerDbContext db
) : Controller
{
    private readonly ILogger<WorkoutProgramController> _logger = logger;

    public async Task<IActionResult> Index(Guid? routineUuid)
    {
        var userId = int.Parse(
            HttpContext
                .User?.Claims?.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)
                ?.Value ?? "-1"
        );

        if (routineUuid != null)
        {
            var joined = await db
                .WorkoutPrograms.Include(workoutProgram => workoutProgram.WorkoutProgramRoutines)
                .ThenInclude(routine => routine.RoutineExercises)
                .Join(
                    db.WorkoutProgramRoutines,
                    workoutProgram => workoutProgram.Id,
                    routine => routine.WorkoutProgramId,
                    (workoutProgram, routine) => new { workoutProgram, routine }
                )
                .Where(joined => joined.workoutProgram.UserId == userId)
                .Where(joined => joined.routine.Uuid == routineUuid)
                .FirstOrDefaultAsync();

            if (joined == null)
                return NotFound();

            SortChildren(joined.workoutProgram);

            return Json(joined.workoutProgram);
        }

        var workoutPrograms = await db
            .WorkoutPrograms.Include(workoutProgram => workoutProgram.WorkoutProgramRoutines)
            .ThenInclude(routine => routine.RoutineExercises)
            .Where(workoutProgram => workoutProgram.UserId == userId)
            .ToListAsync();

        SortChildren(workoutPrograms);

        return Json(workoutPrograms);
    }

    private void SortChildren(List<WorkoutProgram> workoutPrograms)
    {
        foreach (var workoutProgram in workoutPrograms)
            SortChildren(workoutProgram);
    }

    private void SortChildren(WorkoutProgram workoutProgram)
    {
        workoutProgram.WorkoutProgramRoutines = workoutProgram
            .WorkoutProgramRoutines.OrderByPosition()
            .ToList();

        foreach (var workoutProgramRoutine in workoutProgram.WorkoutProgramRoutines)
            workoutProgramRoutine.RoutineExercises = workoutProgramRoutine
                .RoutineExercises.OrderByPosition()
                .ToList();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(
            new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier }
        );
    }
}
