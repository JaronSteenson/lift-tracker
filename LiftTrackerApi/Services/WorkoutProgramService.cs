using LiftTrackerApi.Entities;
using LiftTrackerApi.Extensions;
using Microsoft.EntityFrameworkCore;

namespace LiftTrackerApi.Services;

public class WorkoutProgramService(LiftTrackerDbContext db)
{
    public async Task<object?> FindWorkoutProgramByRoutineUuid(int userId, Guid routineUuid)
    {
        var query = db
            .WorkoutPrograms.Include(workoutProgram => workoutProgram.WorkoutProgramRoutines)
            .ThenInclude(routine => routine.RoutineExercises)
            .Join(
                db.WorkoutProgramRoutines,
                workoutProgram => workoutProgram.Id,
                routine => routine.WorkoutProgramId,
                (workoutProgram, routine) => new { workoutProgram, routine }
            )
            .Where(joined => joined.workoutProgram.UserId == userId)
            .Where(joined => joined.routine.Uuid == routineUuid);

        var joined = await query.AsNoTracking().FirstOrDefaultAsync();

        if (joined == null)
            return null;

        SortChildren(joined.workoutProgram);
        return joined.workoutProgram;
    }

    public async Task<List<WorkoutProgram>> FindWorkoutProgramsForUserId(int userId)
    {
        var query = db
            .WorkoutPrograms.Include(workoutProgram => workoutProgram.WorkoutProgramRoutines)
            .ThenInclude(routine => routine.RoutineExercises)
            .Where(workoutProgram => workoutProgram.UserId == userId);

        var workoutPrograms = await query.AsNoTracking().ToListAsync();
        SortChildren(workoutPrograms);

        return workoutPrograms;
    }

    public async Task<ICollection<WorkoutProgramRoutine>> FindRoutinesForUserId(int userId)
    {
        var query = db
            .WorkoutProgramRoutines.Include(routine => routine.WorkoutProgram)
            .Include(routine => routine.RoutineExercises)
            .Where(routine =>
                routine.WorkoutProgram != null && routine.WorkoutProgram.UserId == userId
            )
            // Ordered by last "touched" rather than position, so that most recently used or updated are shown first.
            .OrderByDescending(routine => routine.UpdatedAt ?? routine.CreatedAt);

        var routines = await query.AsNoTracking().ToListAsync();
        SortChildren(routines);

        return routines;
    }

    private void SortChildren(ICollection<WorkoutProgram> workoutPrograms)
    {
        foreach (var workoutProgram in workoutPrograms)
            SortChildren(workoutProgram);
    }

    private void SortChildren(WorkoutProgram workoutProgram)
    {
        workoutProgram.WorkoutProgramRoutines.OrderByPosition();

        SortChildren(workoutProgram.WorkoutProgramRoutines);
    }

    private void SortChildren(ICollection<WorkoutProgramRoutine> workoutProgramRoutines)
    {
        foreach (var workoutProgramRoutine in workoutProgramRoutines)
            workoutProgramRoutine.RoutineExercises.OrderByPosition();
    }
}
