using LiftTrackerApi.Entities;
using LiftTrackerApi.Exceptions;
using LiftTrackerApi.Extensions;
using Microsoft.EntityFrameworkCore;

namespace LiftTrackerApi.Services;

public class WorkoutProgramService(LiftTrackerDbContext db, UuidService uuidService)
{
    public async Task<object?> FindWorkoutProgramByRoutineUuid(Guid routineUuid, int userId)
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

    /// <summary>
    /// Simple nested  create method for a new WorkoutProgram with children (WorkoutProgramRoutine, and RoutineExercises),.
    /// </summary>
    public async Task<WorkoutProgram> CreateWithChildren(
        WorkoutProgram newWorkoutProgram,
        int userId
    )
    {
        newWorkoutProgram.UserId = userId;
        await VerifyOrAssignNewUuids(newWorkoutProgram);

        await db.AddAsync(newWorkoutProgram);
        await db.SaveChangesAsync();

        SortChildren(newWorkoutProgram);
        return newWorkoutProgram;
    }

    /// <summary>
    /// Nested update method for an existing WorkoutProgram with children (WorkoutProgramRoutine, and RoutineExercises).
    /// If any children are not present in the updated WorkoutProgram, they will be removed.
    /// </summary>
    public async Task<WorkoutProgram> UpdateWithChildren(WorkoutProgram updated, int userId)
    {
        if (updated.Uuid is not Guid uuid)
        {
            throw new ArgumentException("WorkoutProgram UUID must be set for update operations.");
        }

        var existing = await FindByUuidAndOwner(uuid, userId);
        db.ChangeTracker.Clear();

        updated.Id = existing.Id;
        updated.CreatedAt = existing.CreatedAt;
        db.Entry(updated).State = EntityState.Modified;

        PatchRoutines(updated, existing);
        PatchExercises(updated, existing);

        await db.SaveChangesAsync();

        updated = await FindByUuidAndOwner(uuid, userId);
        SortChildren(updated);
        return updated;
    }

    private void PatchRoutines(WorkoutProgram updatedProgram, WorkoutProgram existingProgram)
    {
        var updatedMap = updatedProgram.WorkoutProgramRoutines.ToDictionary(r =>
            r.Uuid ?? Guid.NewGuid()
        );
        var existingMap = existingProgram.WorkoutProgramRoutines.ToDictionary(r =>
            r.Uuid ?? Guid.NewGuid()
        );
        foreach (var updated in updatedProgram.WorkoutProgramRoutines)
        {
            var existing = existingMap.GetValueOrDefault(updated.Uuid ?? Guid.NewGuid());

            if (existing == null)
            {
                db.Entry(updated).State = EntityState.Added;
            }
            else
            {
                updated.Id = existing.Id;
                updated.CreatedAt = existing.CreatedAt;
                db.Entry(updated).State = EntityState.Modified;
            }
        }

        foreach (var existing in existingProgram.WorkoutProgramRoutines)
        {
            var stillExists = updatedMap.ContainsKey(existing.Uuid ?? Guid.NewGuid());
            if (!stillExists)
            {
                db.Entry(existing).State = EntityState.Deleted;
            }
        }
    }

    private void PatchExercises(WorkoutProgram updatedProgram, WorkoutProgram existingProgram)
    {
        var existingMap = existingProgram
            .WorkoutProgramRoutines.SelectMany(routine => routine.RoutineExercises)
            .ToDictionary(exercise => exercise.Uuid ?? Guid.Empty);
        var updatedMap = updatedProgram
            .WorkoutProgramRoutines.SelectMany(routine => routine.RoutineExercises)
            .ToDictionary(exercise => exercise.Uuid ?? Guid.Empty);

        foreach (var updated in updatedMap.Values)
        {
            var existing = existingMap.GetValueOrDefault(updated.Uuid ?? Guid.NewGuid());

            if (existing == null)
            {
                db.Entry(updated).State = EntityState.Added;
            }
            else
            {
                updated.Id = existing.Id;
                updated.CreatedAt = existing.CreatedAt;
                db.Entry(updated).State = EntityState.Modified;
            }
        }

        foreach (var existing in existingMap.Values)
        {
            var stillExists = updatedMap.ContainsKey(existing.Uuid ?? Guid.NewGuid());
            if (!stillExists)
            {
                db.Entry(existing).State = EntityState.Deleted;
            }
        }
    }

    private Task<WorkoutProgram> FindByUuidAndOwner(Guid workoutProgramUid, int userId)
    {
        return db.WorkoutPrograms.Include(workoutProgram => workoutProgram.WorkoutProgramRoutines)
                .ThenInclude(routine => routine.RoutineExercises)
                .Where(workoutProgram => workoutProgram.UserId == userId)
                .WhereUuid(workoutProgramUid)
                .AsNoTracking()
                .FirstAsync()
            ?? throw new NotFoundException(
                $"WorkoutProgram with UUID {workoutProgramUid} not found for user {userId}."
            );
    }

    private async Task VerifyOrAssignNewUuids(WorkoutProgram workoutProgram)
    {
        await uuidService.VerifyOrAssignNewEntityUuid(workoutProgram);
        foreach (var routine in workoutProgram.WorkoutProgramRoutines)
        {
            await uuidService.VerifyOrAssignNewEntityUuid(routine);
            foreach (var exercise in routine.RoutineExercises)
            {
                await uuidService.VerifyOrAssignNewEntityUuid(exercise);
            }
        }
    }

    private void SortChildren(ICollection<WorkoutProgram> workoutPrograms)
    {
        foreach (var workoutProgram in workoutPrograms)
            SortChildren(workoutProgram);
    }

    private void SortChildren(WorkoutProgram workoutProgram)
    {
        workoutProgram.WorkoutProgramRoutines = workoutProgram
            .WorkoutProgramRoutines.OrderByPosition()
            .ToList();

        SortChildren(workoutProgram.WorkoutProgramRoutines);
    }

    private void SortChildren(ICollection<WorkoutProgramRoutine> workoutProgramRoutines)
    {
        foreach (var workoutProgramRoutine in workoutProgramRoutines)
            workoutProgramRoutine.RoutineExercises = workoutProgramRoutine
                .RoutineExercises.OrderByPosition()
                .ToList();
    }

    public Task<int> DeleteWorkoutProgram(Guid workoutProgramUuid, int userId)
    {
        var found = FindByUuidAndOwner(workoutProgramUuid, userId);

        try
        {
            db.Remove(found);
            db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
        }

        return Task.FromResult(0);
    }
}
