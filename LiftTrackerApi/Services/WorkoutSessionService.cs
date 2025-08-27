using LiftTrackerApi.Entities;
using LiftTrackerApi.Exceptions;
using LiftTrackerApi.Extensions;
using LiftTrackerApi.Models;
using Microsoft.EntityFrameworkCore;

namespace LiftTrackerApi.Services;

public class WorkoutSessionService(LiftTrackerDbContext db, DomainEntityService domainEntityService)
{
    public async Task<PaginatedList<WorkoutSession>> FindWorkoutSessionsForUserId(
        int userId,
        int pageIndex,
        int pageSize
    )
    {
        var query = db
            .WorkoutSessions.AsNoTracking()
            .Include(session => session.SessionExercises)
            .ThenInclude(exercise => exercise.SessionSets)
            .Include(session => session.SessionExercises)
            .ThenInclude(exercise => exercise.RoutineExercise)
            .Include(session => session.WorkoutProgramRoutine)
            .ThenInclude(routine => routine!.WorkoutProgram)
            .Where(session => session.UserId == userId)
            .OrderByDescending(session => session.CreatedAt);

        var workoutSessions = await PaginatedList<WorkoutSession>.CreateAsync(
            query,
            pageIndex,
            pageSize
        );
        SortChildren(workoutSessions);

        return workoutSessions;
    }

    public async Task<WorkoutSession> FindByUuidAndOwner(Guid uuid, int userId)
    {
        var session =
            await db
                .WorkoutSessions.Include(session => session.SessionExercises)
                .ThenInclude(exercise => exercise.SessionSets)
                .Include(session => session.SessionExercises)
                .ThenInclude(exercise => exercise.RoutineExercise)
                .Include(session => session.WorkoutProgramRoutine)
                .ThenInclude(routine => routine!.WorkoutProgram)
                .Where(workoutSession => workoutSession.UserId == userId)
                .WhereUuid(uuid)
                .AsNoTracking()
                .FirstAsync()
            ?? throw new NotFoundException(
                $"WorkoutSession with UUID {uuid} not found for user {userId}."
            );

        SortChildren(session);

        return session;
    }

    public async Task<SessionExercise> FindSessionExerciseByUuidAndOwner(
        Guid sessionExerciseUuid,
        int userId
    )
    {
        var exercise = await db
            .SessionExercises.AsNoTracking()
            .IgnoreQueryFilters()
            .WhereUuid(sessionExerciseUuid)
            .Include(exercise => exercise.RoutineExercise)
            .Include(exercise => exercise.WorkoutSession)
            .Include(exercise => exercise.SessionSets)
            .FirstOrDefaultAsync();

        if (exercise?.WorkoutSession.UserId != userId)
            throw new NotFoundException(
                $"WorkoutSession with SessionSet UUID {sessionExerciseUuid} not found for user {userId}."
            );

        return exercise;
    }

    public async Task<SessionSet> FindSessionSetByUuidAndOwner(Guid sessionSetUuid, int userId)
    {
        var set = await db
            .SessionSets.AsNoTracking()
            .WhereUuid(sessionSetUuid)
            .Include(set => set.SessionExercise)
            .ThenInclude(exercise => exercise.WorkoutSession)
            .FirstOrDefaultAsync();

        if (set?.SessionExercise.WorkoutSession.UserId != userId)
            throw new NotFoundException(
                $"WorkoutSession with SessionSet UUID {sessionSetUuid} not found for user {userId}."
            );

        return set;
    }

    public async Task<WorkoutSession> FindBySessionSetAndOwner(Guid sessionSetUuid, int userId)
    {
        var set = await db
            .SessionSets.AsNoTracking()
            .WhereUuid(sessionSetUuid)
            .Include(set => set.SessionExercise)
            .ThenInclude(exercise => exercise.WorkoutSession)
            .FirstAsync();

        Guid uuid =
            set.SessionExercise.WorkoutSession.Uuid
            ?? throw new NotFoundException(
                $"WorkoutSession with SessionSet UUID {sessionSetUuid} not found for user {userId}."
            );

        return await FindByUuidAndOwner(uuid, userId);
    }

    /// <summary>
    /// Simple nested  create method for a new WorkoutProgram with children (WorkoutProgramRoutine, and RoutineExercises),.
    /// </summary>
    public async Task<WorkoutSession> CreateWithChildren(
        WorkoutSession newWorkoutSession,
        int userId
    )
    {
        newWorkoutSession.UserId = userId;
        await VerifyOrAssignNewUuids(newWorkoutSession);
        await AssociateSourceRoutine(newWorkoutSession);
        await AssociateSourceExercises(newWorkoutSession);

        await db.AddAsync(newWorkoutSession);
        await db.SaveChangesAsync();

        var savedWorkoutSession = await FindByUuidAndOwner(
            newWorkoutSession.Uuid ?? Guid.Empty,
            userId
        );
        SortChildren(savedWorkoutSession);
        return savedWorkoutSession;
    }

    private async Task AssociateSourceRoutine(WorkoutSession editedWorkoutSession)
    {
        // Associate the WorkoutProgramRoutine if present.
        if (editedWorkoutSession.WorkoutProgramRoutine?.Uuid != null)
        {
            var sourceRoutine =
                await db
                    .WorkoutProgramRoutines.WhereUuid(
                        editedWorkoutSession.WorkoutProgramRoutine?.Uuid
                    )
                    .FirstOrDefaultAsync()
                ?? throw new NotFoundException(
                    $"WorkoutProgramRoutine with UUID {editedWorkoutSession.WorkoutProgramRoutine?.Uuid} not found."
                );

            // Touch it so it's sorted to the top of the routine list.
            db.Entry(sourceRoutine).State = EntityState.Modified;
            editedWorkoutSession.WorkoutProgramRoutine = sourceRoutine;
        }
    }

    private async Task AssociateSourceExercises(WorkoutSession newWorkoutSession)
    {
        var allSourceUuids = newWorkoutSession
            .SessionExercises.Select(exercise => exercise.RoutineExercise?.Uuid)
            .ToList();

        if (allSourceUuids.Count == 0)
        {
            return;
        }

        var sourceRoutinesMap = await db
            .RoutineExercises.AsNoTracking()
            .IgnoreQueryFilters() // Allow deleted exercises to be included.
            .Where(exercise => allSourceUuids.Contains(exercise.Uuid))
            .ToDictionaryAsync(re => re.Uuid ?? Guid.NewGuid());

        foreach (var sessionExercise in newWorkoutSession.SessionExercises)
        {
            var sourceExercise = sourceRoutinesMap.GetValueOrDefault(
                sessionExercise?.RoutineExercise?.Uuid ?? Guid.Empty
            );
            if (sourceExercise == null)
            {
                continue;
            }

            db.Entry(sourceExercise).State = EntityState.Modified;
            sessionExercise!.RoutineExercise = sourceExercise;
        }
    }

    /// <summary>
    /// Nested update method for an existing WorkoutProgram with children (WorkoutProgramRoutine, and RoutineExercises).
    /// If any children are not present in the updated WorkoutProgram, they will be removed.
    /// </summary>
    public async Task<WorkoutSession> UpdateWithChildren(WorkoutSession updated, int userId)
    {
        if (!updated.Uuid.HasValue)
        {
            throw new ArgumentException("WorkoutSession UUID must be set for update operations.");
        }

        var existing = await FindByUuidAndOwner(updated.Uuid.Value, userId);
        domainEntityService.ReattachRequestEntity(existing: existing, updated: updated);

        domainEntityService.TrackEntityDiffChanges(
            existingMap: ToExerciseMap(existing),
            updatedMap: ToExerciseMap(updated)
        );
        domainEntityService.TrackEntityDiffChanges(
            existingMap: ToSetMap(existing),
            updatedMap: ToSetMap(updated)
        );

        await db.SaveChangesAsync();

        if (existing.WorkoutProgramRoutine == null)
        {
            await AssociateSourceRoutine(updated);
            await AssociateSourceExercises(updated);

            db.Update(updated);
            await db.SaveChangesAsync();
        }

        var savedWorkoutSession = await FindByUuidAndOwner(updated.Uuid.Value, userId);
        SortChildren(savedWorkoutSession);
        return savedWorkoutSession;
    }

    public async Task<SessionExercise> UpdateWithChildren(SessionExercise updated, int userId)
    {
        if (!updated.Uuid.HasValue)
        {
            throw new ArgumentException("SessionExercise UUID must be set for update operations.");
        }

        var existing = await FindSessionExerciseByUuidAndOwner(updated.Uuid.Value, userId);

        domainEntityService.ReattachRequestEntity(existing: existing, updated: updated);
        domainEntityService.TrackEntityDiffChanges(
            existingMap: ToSetMap(existing),
            updatedMap: ToSetMap(updated)
        );

        await db.SaveChangesAsync();

        var savedSessionExercise = await FindSessionExerciseByUuidAndOwner(
            updated.Uuid.Value,
            userId
        );
        SortChildren(savedSessionExercise);
        return savedSessionExercise;
    }

    public async Task<SessionSet> UpdateSet(SessionSet updated, int userId)
    {
        if (!updated.Uuid.HasValue)
        {
            throw new ArgumentException("SessionExercise UUID must be set for update operations.");
        }

        var existing = await FindSessionSetByUuidAndOwner(updated.Uuid.Value, userId);

        domainEntityService.ReattachRequestEntity(existing: existing, updated: updated);
        await db.SaveChangesAsync();

        var saved = await FindSessionSetByUuidAndOwner(updated.Uuid.Value, userId);
        return saved;
    }

    public async Task DeleteWorkoutSession(Guid workoutSessionUuid, int userId)
    {
        var found = await FindByUuidAndOwner(workoutSessionUuid, userId);

        db.Remove(found);
        await db.SaveChangesAsync();
    }

    public async Task<List<SessionExercise>> GetExerciseHistory(
        Guid sourceSessionExerciseUuid,
        int userId
    )
    {
        var sourceExercise = await FindSessionExerciseByUuidAndOwner(
            sourceSessionExerciseUuid,
            userId
        );

        if (sourceExercise.RoutineExercise == null)
        {
            return [];
        }

        var history = await db
            .SessionExercises.Include(exercise => exercise.SessionSets)
            .Include(exercise => exercise.RoutineExercise)
            .Where(exercise =>
                exercise.RoutineExercise != null
                && exercise.RoutineExercise.Id == sourceExercise.RoutineExercise.Id
            )
            .Where(exercise => !exercise.Skipped)
            .Where(exercise => exercise.WorkoutSession.UserId == userId)
            .Where(exercise => exercise.CreatedAt <= sourceExercise.CreatedAt)
            .OrderBy(exercise => exercise.WorkoutSession.CreatedAt)
            .Take(50)
            .ToListAsync();

        SortChildren(history);

        return history;
    }

    private Dictionary<Guid, SessionExercise> ToExerciseMap(WorkoutSession session)
    {
        return session.SessionExercises.ToDictionary(exercise => exercise.Uuid ?? Guid.NewGuid());
    }

    private Dictionary<Guid, SessionSet> ToSetMap(WorkoutSession session)
    {
        return session
            .SessionExercises.SelectMany(exercise => exercise.SessionSets)
            .ToDictionary(set => set.Uuid ?? Guid.Empty);
    }

    private Dictionary<Guid, SessionSet> ToSetMap(SessionExercise exercise)
    {
        return exercise.SessionSets.ToDictionary(set => set.Uuid ?? Guid.Empty);
    }

    private async Task VerifyOrAssignNewUuids(WorkoutSession workoutSession)
    {
        await domainEntityService.VerifyOrAssignNewEntityUuid(workoutSession);
        foreach (var exercise in workoutSession.SessionExercises)
        {
            await domainEntityService.VerifyOrAssignNewEntityUuid(exercise);
            foreach (var set in exercise.SessionSets)
            {
                await domainEntityService.VerifyOrAssignNewEntityUuid(set);
            }
        }
    }

    private void SortChildren(ICollection<WorkoutSession> workoutSessions)
    {
        foreach (var workoutSession in workoutSessions)
            SortChildren(workoutSession);
    }

    private void SortChildren(WorkoutSession workoutSession)
    {
        workoutSession.SessionExercises = workoutSession
            .SessionExercises.OrderByPosition()
            .ToList();

        SortChildren(workoutSession.SessionExercises);
    }

    private void SortChildren(ICollection<SessionExercise> exercises)
    {
        foreach (var exercise in exercises)
        {
            SortChildren(exercise);
        }
    }

    private void SortChildren(SessionExercise exercise)
    {
        exercise.SessionSets = exercise.SessionSets.OrderByPosition().ToList();
    }
}
