using System.Security.Claims;
using LiftTrackerApi.Entities;
using LiftTrackerApi.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LiftTrackerApi.Controllers;

public class WorkoutProgramController(LiftTrackerDbContext db) : Controller
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

        var query = db
            .WorkoutPrograms.Include(workoutProgram => workoutProgram.WorkoutProgramRoutines)
            .ThenInclude(routine => routine.RoutineExercises)
            .Where(workoutProgram => workoutProgram.UserId == userId);

        var workoutPrograms = await query.ToListAsync();
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
}
