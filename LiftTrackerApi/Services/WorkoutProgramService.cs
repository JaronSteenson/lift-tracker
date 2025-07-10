using LiftTrackerApi.Entities;
using LiftTrackerApi.Exceptions;
using LiftTrackerApi.Extensions;
using Microsoft.EntityFrameworkCore;

namespace LiftTrackerApi.Services;

public class WorkoutProgramService(LiftTrackerDbContext db, DomainEntityService domainEntityService)
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
            .Where(workoutProgram => workoutProgram.UserId == userId)
            .OrderBy(workoutProgram => workoutProgram.Name);

        var workoutPrograms = await query.AsNoTracking().ToListAsync();
        SortChildren(workoutPrograms);

        return workoutPrograms;
    }

    public async Task<WorkoutProgram> FindByUuidAndOwner(Guid workoutProgramUid, int userId)
    {
        var workoutProgram =
            await db
                .WorkoutPrograms.AsNoTracking()
                .Include(workoutProgram => workoutProgram.WorkoutProgramRoutines)
                .ThenInclude(routine => routine.RoutineExercises)
                .Where(workoutProgram => workoutProgram.UserId == userId)
                .WhereUuid(workoutProgramUid)
                .FirstOrDefaultAsync()
            ?? throw new NotFoundException(
                $"WorkoutProgram with UUID {workoutProgramUid} not found for user {userId}."
            );

        SortChildren(workoutProgram);

        return workoutProgram;
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

        var savedWorkoutProgram = await FindByUuidAndOwner(
            newWorkoutProgram.Uuid ?? Guid.Empty,
            userId
        );
        SortChildren(savedWorkoutProgram);
        return savedWorkoutProgram;
    }

    /// <summary>
    /// Nested update method for an existing WorkoutProgram with children (WorkoutProgramRoutine, and RoutineExercises).
    /// If any children are not present in the updated WorkoutProgram, they will be removed.
    /// </summary>
    public async Task<WorkoutProgram> UpdateWithChildren(WorkoutProgram updated, int userId)
    {
        if (!updated.Uuid.HasValue)
        {
            throw new ArgumentException("WorkoutProgram UUID must be set for update operations.");
        }

        var existing = await FindByUuidAndOwner(updated.Uuid.Value, userId);

        domainEntityService.ReattachRequestEntity(existing: existing, updated: updated);
        domainEntityService.TrackEntityDiffChanges(
            existingMap: ToRoutineMap(existing),
            updatedMap: ToRoutineMap(updated)
        );
        domainEntityService.TrackEntityDiffChanges(
            existingMap: ToExerciseMap(existing),
            updatedMap: ToExerciseMap(updated)
        );

        await db.SaveChangesAsync();

        var savedWorkoutProgram = await FindByUuidAndOwner(updated.Uuid.Value, userId);
        SortChildren(savedWorkoutProgram);
        return savedWorkoutProgram;
    }

    public async Task DeleteWorkoutProgram(Guid workoutProgramUuid, int userId)
    {
        var found = await FindByUuidAndOwner(workoutProgramUuid, userId);

        db.Remove(found);
        await db.SaveChangesAsync();
    }

    private Dictionary<Guid, WorkoutProgramRoutine> ToRoutineMap(WorkoutProgram program)
    {
        return program.WorkoutProgramRoutines.ToDictionary(r => r.Uuid ?? Guid.NewGuid());
    }

    private Dictionary<Guid, RoutineExercise> ToExerciseMap(WorkoutProgram program)
    {
        return program
            .WorkoutProgramRoutines.SelectMany(routine => routine.RoutineExercises)
            .ToDictionary(exercise => exercise.Uuid ?? Guid.Empty);
    }

    private async Task VerifyOrAssignNewUuids(WorkoutProgram workoutProgram)
    {
        await domainEntityService.VerifyOrAssignNewEntityUuid(workoutProgram);
        foreach (var routine in workoutProgram.WorkoutProgramRoutines)
        {
            await domainEntityService.VerifyOrAssignNewEntityUuid(routine);
            foreach (var exercise in routine.RoutineExercises)
            {
                await domainEntityService.VerifyOrAssignNewEntityUuid(exercise);
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
}
