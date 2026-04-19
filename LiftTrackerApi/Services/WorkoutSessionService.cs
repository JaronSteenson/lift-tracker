using LiftTrackerApi.Dtos;
using LiftTrackerApi.Entities;
using LiftTrackerApi.Exceptions;
using LiftTrackerApi.Extensions;
using Microsoft.EntityFrameworkCore;

namespace LiftTrackerApi.Services;

public class WorkoutSessionService(
    LiftTrackerDbContext db,
    DomainEntityService domainEntityService,
    WorkoutProgramService workoutProgramService,
    ProgressionSchemeRegistry progressionSchemeRegistry
)
{
    public async Task<PaginatedListDto<WorkoutSession>> FindWorkoutSessionsForUserId(
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

        var workoutSessions = await PaginatedListDto<WorkoutSession>.CreateAsync(
            query,
            pageIndex,
            pageSize
        );
        SortChildren(workoutSessions.Items);

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

    public async Task<WorkoutSession?> FindInProgressForOwner(int userId)
    {
        var session = await db
            .WorkoutSessions.Include(workoutSession => workoutSession.SessionExercises)
            .ThenInclude(exercise => exercise.SessionSets)
            .Include(workoutSession => workoutSession.SessionExercises)
            .ThenInclude(exercise => exercise.RoutineExercise)
            .Include(workoutSession => workoutSession.WorkoutProgramRoutine)
            .ThenInclude(routine => routine!.WorkoutProgram)
            .Where(workoutSession => workoutSession.UserId == userId)
            .Where(workoutSession => workoutSession.StartedAt != null)
            .Where(workoutSession => workoutSession.EndedAt == null)
            .OrderByDescending(workoutSession => workoutSession.UpdatedAt)
            .ThenByDescending(workoutSession => workoutSession.CreatedAt)
            .ThenByDescending(workoutSession => workoutSession.Id)
            .AsNoTracking()
            .FirstOrDefaultAsync();

        if (session == null)
        {
            return null;
        }

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
        WorkoutSessionDto request,
        int userId
    )
    {
        var newWorkoutSession = MapWorkoutSession(request);
        newWorkoutSession.UserId = userId;
        await VerifyOrAssignNewUuids(newWorkoutSession);
        await AssociateSourceRoutine(newWorkoutSession, request.WorkoutProgramRoutineUuid);
        await AssociateSourceExercises(newWorkoutSession, request.SessionExercises);

        await db.AddAsync(newWorkoutSession);
        await db.SaveChangesAsync();

        var savedWorkoutSession = await FindByUuidAndOwner(
            newWorkoutSession.Uuid ?? Guid.Empty,
            userId
        );
        SortChildren(savedWorkoutSession);
        return savedWorkoutSession;
    }

    public async Task<WorkoutSession> StartWorkout(StartWorkoutRequestDto request, int userId)
    {
        if (!request.RoutineUuid.HasValue)
        {
            throw new ArgumentException("Routine UUID is required.");
        }

        var routine = await workoutProgramService.FindRoutineByUuidAndOwner(request.RoutineUuid.Value, userId);
        var startedAt = DateTime.UtcNow;
        var existingCheckIn = await db
            .WorkoutSessions.Include(session => session.SessionExercises)
            .ThenInclude(exercise => exercise.SessionSets)
            .Where(session => session.UserId == userId)
            .Where(session => session.StartedAt == null)
            .Where(session => session.CreatedAt >= startedAt.Date)
            .Where(session => session.CreatedAt < startedAt.Date.AddDays(1))
            .OrderByDescending(session => session.UpdatedAt ?? session.CreatedAt)
            .FirstOrDefaultAsync();

        WorkoutSession session;
        if (existingCheckIn == null)
        {
            db.Entry(routine).State = EntityState.Modified;
            session = new WorkoutSession
            {
                UserId = userId,
                Name = routine.Name,
                StartedAt = startedAt,
                EndedAt = null,
                WorkoutProgramRoutine = routine,
                SessionExercises = BuildSessionExercises(routine),
            };

            await VerifyOrAssignNewUuids(session);
            await db.AddAsync(session);
        }
        else
        {
            if (existingCheckIn.SessionExercises.Count > 0)
            {
                db.RemoveRange(existingCheckIn.SessionExercises.SelectMany(exercise => exercise.SessionSets));
                db.RemoveRange(existingCheckIn.SessionExercises);
            }

            db.Entry(routine).State = EntityState.Modified;
            existingCheckIn.Name = routine.Name;
            existingCheckIn.StartedAt = startedAt;
            existingCheckIn.EndedAt = null;
            existingCheckIn.WorkoutProgramRoutine = routine;
            existingCheckIn.SessionExercises = BuildSessionExercises(routine);
            session = existingCheckIn;
            await AssignNewChildUuids(session.SessionExercises);
        }

        MarkFirstSetStarted(session, startedAt);

        await db.SaveChangesAsync();

        var savedWorkoutSession = await FindByUuidAndOwner(session.Uuid ?? Guid.Empty, userId);
        SortChildren(savedWorkoutSession);
        return savedWorkoutSession;
    }

    private async Task AssociateSourceRoutine(
        WorkoutSession editedWorkoutSession,
        Guid? workoutProgramRoutineUuid
    )
    {
        // Associate the WorkoutProgramRoutine if present.
        if (workoutProgramRoutineUuid != null)
        {
            var sourceRoutine =
                await db.WorkoutProgramRoutines.WhereUuid(workoutProgramRoutineUuid).FirstOrDefaultAsync()
                ?? throw new NotFoundException(
                    $"WorkoutProgramRoutine with UUID {workoutProgramRoutineUuid} not found."
                );

            // Touch it so it's sorted to the top of the routine list.
            db.Entry(sourceRoutine).State = EntityState.Modified;
            editedWorkoutSession.WorkoutProgramRoutine = sourceRoutine;
        }
    }

    private async Task AssociateSourceExercises(
        WorkoutSession newWorkoutSession,
        IEnumerable<SessionExerciseDto> exerciseRequests
    )
    {
        var requestExerciseMap = exerciseRequests.ToDictionary(
            exercise => exercise.Uuid ?? Guid.NewGuid()
        );
        var allSourceUuids = exerciseRequests
            .Select(exercise => exercise.RoutineExerciseUuid)
            .Where(uuid => uuid != null)
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
            var requestExercise = requestExerciseMap.GetValueOrDefault(
                sessionExercise.Uuid ?? Guid.Empty
            );
            var sourceExercise = sourceRoutinesMap.GetValueOrDefault(
                requestExercise?.RoutineExerciseUuid ?? Guid.Empty
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
    public async Task<WorkoutSession> UpdateWithChildren(
        WorkoutSessionDto request,
        int userId
    )
    {
        if (!request.Uuid.HasValue)
        {
            throw new ArgumentException("WorkoutSession UUID must be set for update operations.");
        }

        var updated = MapWorkoutSession(request);
        await AssociateSourceRoutine(updated, request.WorkoutProgramRoutineUuid);
        await AssociateSourceExercises(updated, request.SessionExercises);

        var existing = await FindByUuidAndOwner(request.Uuid.Value, userId);
        var shouldAdvanceProgression = existing.EndedAt == null && updated.EndedAt != null;
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

        if (shouldAdvanceProgression)
        {
            await AdvanceProgressionSchemes(updated);
            await AdvanceRotationGroupsOnCompletion(updated);
            await db.SaveChangesAsync();
        }

        if (existing.WorkoutProgramRoutine == null)
        {
            db.Update(updated);
            await db.SaveChangesAsync();
        }

        var savedWorkoutSession = await FindByUuidAndOwner(request.Uuid.Value, userId);
        SortChildren(savedWorkoutSession);
        return savedWorkoutSession;
    }

    public async Task<SessionExercise> UpdateWithChildren(SessionExerciseDto request, int userId)
    {
        if (!request.Uuid.HasValue)
        {
            throw new ArgumentException("SessionExercise UUID must be set for update operations.");
        }

        var updated = MapSessionExercise(request);
        await AssociateSourceExercise(updated, request.RoutineExerciseUuid);

        var existing = await FindSessionExerciseByUuidAndOwner(request.Uuid.Value, userId);

        domainEntityService.ReattachRequestEntity(existing: existing, updated: updated);
        domainEntityService.TrackEntityDiffChanges(
            existingMap: ToSetMap(existing),
            updatedMap: ToSetMap(updated)
        );

        await db.SaveChangesAsync();

        var savedSessionExercise = await FindSessionExerciseByUuidAndOwner(
            request.Uuid.Value,
            userId
        );
        SortChildren(savedSessionExercise);
        return savedSessionExercise;
    }

    public async Task<SessionSet> UpdateSet(SessionSetDto request, int userId)
    {
        if (!request.Uuid.HasValue)
        {
            throw new ArgumentException("SessionExercise UUID must be set for update operations.");
        }

        var existing = await FindSessionSetByUuidAndOwner(request.Uuid.Value, userId);
        var updated = MapSessionSet(request);
        updated.SessionExerciseId = existing.SessionExerciseId;

        domainEntityService.ReattachRequestEntity(existing: existing, updated: updated);
        await db.SaveChangesAsync();

        var saved = await FindSessionSetByUuidAndOwner(request.Uuid.Value, userId);
        return saved;
    }

    public async Task DeleteWorkoutSession(Guid workoutSessionUuid, int userId)
    {
        var found = await FindByUuidAndOwner(workoutSessionUuid, userId);

        db.Remove(found);
        await db.SaveChangesAsync();
    }

    public async Task<PaginatedListDto<SessionExercise>> GetExerciseHistory(
        Guid sourceSessionExerciseUuid,
        int userId,
        int pageIndex,
        int pageSize
    )
    {
        var sourceExercise = await FindSessionExerciseByUuidAndOwner(
            sourceSessionExerciseUuid,
            userId
        );

        var sourceRoutineExerciseId = sourceExercise.RoutineExercise?.Id;
        if (sourceRoutineExerciseId == null)
        {
            return new PaginatedListDto<SessionExercise>([], 0, pageIndex, pageSize);
        }

        var historyQuery = db
            .SessionExercises.Include(exercise => exercise.SessionSets)
            .Include(exercise => exercise.RoutineExercise)
            .Include(exercise => exercise.WorkoutSession)
            .Where(exercise => EF.Property<int?>(exercise, "RoutineExerciseId") == sourceRoutineExerciseId)
            .Where(exercise => !exercise.Skipped)
            .Where(exercise => exercise.WorkoutSession.UserId == userId)
            .Where(exercise => exercise.CreatedAt <= sourceExercise.CreatedAt)
            .OrderByDescending(exercise => exercise.WorkoutSession.CreatedAt)
            .ThenByDescending(exercise => exercise.Id);

        var pagedHistory = await PaginatedListDto<SessionExercise>.CreateAsync(
            historyQuery,
            pageIndex,
            pageSize
        );

        var orderedPage = pagedHistory
            .Items
            .OrderBy(exercise => exercise.WorkoutSession.CreatedAt)
            .ThenBy(exercise => exercise.Id)
            .ToList();

        SortChildren(orderedPage);

        return new PaginatedListDto<SessionExercise>(
            orderedPage,
            pagedHistory.TotalCount,
            pagedHistory.PageIndex,
            pagedHistory.PageSize
        );
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

    private async Task AssociateSourceExercise(SessionExercise sessionExercise, Guid? routineExerciseUuid)
    {
        if (routineExerciseUuid == null)
        {
            return;
        }

        var sourceExercise =
            await db.RoutineExercises.WhereUuid(routineExerciseUuid).FirstOrDefaultAsync()
            ?? throw new NotFoundException(
                $"RoutineExercise with UUID {routineExerciseUuid} not found."
            );

        db.Entry(sourceExercise).State = EntityState.Modified;
        sessionExercise.RoutineExercise = sourceExercise;
    }

    private async Task AdvanceProgressionSchemes(WorkoutSession session)
    {
        var routineExerciseIds = session.SessionExercises
            .Where(exercise => !exercise.Skipped)
            .Where(exercise => exercise.ProgressionScheme != null)
            .Select(exercise => exercise.RoutineExercise?.Id)
            .Where(id => id != null)
            .Distinct()
            .ToList();

        if (routineExerciseIds.Count == 0)
        {
            return;
        }

        var routineExercises = await db
            .RoutineExercises.Where(exercise => routineExerciseIds.Contains(exercise.Id))
            .ToDictionaryAsync(exercise => exercise.Id!.Value);
        var advancedRoutineExerciseIds = new HashSet<int>();

        foreach (var sessionExercise in session.SessionExercises.Where(exercise => !exercise.Skipped))
        {
            if (sessionExercise.ProgressionScheme == null)
            {
                continue;
            }

            var routineExerciseId = sessionExercise.RoutineExercise?.Id;
            if (routineExerciseId == null)
            {
                continue;
            }

            var routineExerciseKey = routineExerciseId.Value;
            if (
                !routineExercises.TryGetValue(routineExerciseKey, out var routineExercise)
                || !advancedRoutineExerciseIds.Add(routineExerciseKey)
            )
            {
                continue;
            }

            var strategy = progressionSchemeRegistry.GetRequiredStrategy(sessionExercise.ProgressionScheme);
            strategy.Advance(routineExercise);
        }
    }

    private List<SessionExercise> BuildSessionExercises(WorkoutProgramRoutine routine)
    {
        var selectedExercises = GetSelectedRoutineExercises(routine);

        if (selectedExercises.Count == 0)
        {
            return [CreateExerciseForEmptyWorkout(routine.Name)];
        }

        return selectedExercises
            .OrderBy(selection => selection.Position)
            .Select((selection, index) =>
            {
                var sessionExercise = CreateSessionExerciseFromRoutineExercise(selection.RoutineExercise);
                sessionExercise.Position = index;
                return sessionExercise;
            })
            .ToList();
    }

    private List<(RoutineExercise RoutineExercise, int Position)> GetSelectedRoutineExercises(
        WorkoutProgramRoutine routine
    )
    {
        var selectedExercises = routine.RoutineExercises
            .Where(exercise => exercise.RoutineExerciseRotationGroupId == null)
            .Select(exercise => (RoutineExercise: exercise, Position: exercise.Position))
            .ToList();

        foreach (var rotationGroup in routine.RoutineExerciseRotationGroups)
        {
            var groupExercises = routine.RoutineExercises
                .Where(exercise => exercise.RoutineExerciseRotationGroupId == rotationGroup.Id)
                .OrderBy(exercise => exercise.RotationGroupPosition ?? int.MaxValue)
                .ThenBy(exercise => exercise.Position)
                .ToList();

            if (groupExercises.Count == 0)
            {
                continue;
            }

            var currentIndex =
                rotationGroup.NextExerciseIndex < 0
                    ? 0
                    : rotationGroup.NextExerciseIndex % groupExercises.Count;
            selectedExercises.Add(
                (
                    groupExercises[currentIndex],
                    groupExercises.Min(exercise => exercise.Position)
                )
            );
        }

        return selectedExercises;
    }

    private async Task AdvanceRotationGroupsOnCompletion(WorkoutSession session)
    {
        var rotationGroupIds = session.SessionExercises
            .Select(exercise => exercise.RoutineExercise?.RoutineExerciseRotationGroupId)
            .Where(id => id != null)
            .Select(id => id!.Value)
            .Distinct()
            .ToList();

        if (rotationGroupIds.Count == 0)
        {
            return;
        }

        var rotationGroups = await db
            .RoutineExerciseRotationGroups.Where(group => rotationGroupIds.Contains(group.Id!.Value))
            .ToListAsync();

        foreach (var rotationGroup in rotationGroups)
        {
            var groupExerciseCount = await db.RoutineExercises.CountAsync(exercise =>
                exercise.RoutineExerciseRotationGroupId == rotationGroup.Id
            );

            if (groupExerciseCount == 0)
            {
                rotationGroup.NextExerciseIndex = 0;
                continue;
            }

            var currentIndex =
                rotationGroup.NextExerciseIndex < 0
                    ? 0
                    : rotationGroup.NextExerciseIndex % groupExerciseCount;
            rotationGroup.NextExerciseIndex = (currentIndex + 1) % groupExerciseCount;
        }
    }

    private SessionExercise CreateSessionExerciseFromRoutineExercise(RoutineExercise routineExercise)
    {
        if (routineExercise.ProgressionScheme == null)
        {
            return new SessionExercise
            {
                Name = routineExercise.Name ?? "Unnamed exercise",
                PlannedWeight = routineExercise.Weight,
                ProgressionScheme = null,
                PlannedRpe = routineExercise.Rpe,
                PlannedRestPeriodDuration = routineExercise.RestPeriod,
                Position = routineExercise.Position,
                Skipped = false,
                PlannedWarmUp = routineExercise.WarmUp,
                WarmUpDuration = routineExercise.WarmUp,
                RoutineExercise = routineExercise,
                SessionSets = Enumerable
                    .Range(0, routineExercise.NumberOfSets ?? 1)
                    .Select(index => new SessionSet
                    {
                        Position = index,
                        Weight = routineExercise.Weight,
                        Rpe = routineExercise.Rpe,
                        RestPeriodDuration = routineExercise.RestPeriod,
                    })
                    .ToList(),
            };
        }

        var strategy = progressionSchemeRegistry.GetRequiredStrategy(routineExercise.ProgressionScheme);
        var sessionExercise = strategy.CreateSessionExercise(routineExercise);
        sessionExercise.RoutineExercise = routineExercise;
        return sessionExercise;
    }

    private static SessionExercise CreateExerciseForEmptyWorkout(string? routineName)
    {
        return new SessionExercise
        {
            Name = routineName ?? "Workout",
            Position = 0,
            PlannedWeight = null,
            ProgressionScheme = null,
            PlannedRpe = null,
            PlannedRestPeriodDuration = null,
            PlannedWarmUp = null,
            WarmUpDuration = null,
            Skipped = false,
            SessionSets =
            [
                new SessionSet
                {
                    Position = 0,
                },
            ],
        };
    }

    private static void MarkFirstSetStarted(WorkoutSession session, DateTime startedAt)
    {
        var firstSet = session.SessionExercises
            .OrderBy(exercise => exercise.Position)
            .FirstOrDefault()
            ?.SessionSets.OrderBy(set => set.Position)
            .FirstOrDefault();

        if (firstSet != null)
        {
            firstSet.StartedAt = startedAt;
        }
    }

    private async Task AssignNewChildUuids(IEnumerable<SessionExercise> exercises)
    {
        foreach (var exercise in exercises)
        {
            await domainEntityService.VerifyOrAssignNewEntityUuid(exercise);
            foreach (var set in exercise.SessionSets)
            {
                await domainEntityService.VerifyOrAssignNewEntityUuid(set);
            }
        }
    }

    private static WorkoutSession MapWorkoutSession(WorkoutSessionDto request)
    {
        return new WorkoutSession
        {
            Uuid = request.Uuid,
            CreatedAt = request.CreatedAt,
            UpdatedAt = request.UpdatedAt,
            Name = request.Name,
            StartedAt = request.StartedAt,
            EndedAt = request.EndedAt,
            Notes = request.Notes,
            BodyWeight = request.BodyWeight,
            SessionExercises = request.SessionExercises.Select(MapSessionExercise).ToList(),
        };
    }

    private static SessionExercise MapSessionExercise(SessionExerciseDto request)
    {
        return new SessionExercise
        {
            Uuid = request.Uuid,
            CreatedAt = request.CreatedAt,
            UpdatedAt = request.UpdatedAt,
            Name = request.Name,
            PlannedWeight = request.PlannedWeight,
            ProgressionScheme = request.ProgressionScheme,
            PlannedRpe = request.PlannedRpe,
            PlannedRestPeriodDuration = request.PlannedRestPeriodDuration,
            Notes = request.Notes,
            Position = request.Position,
            Skipped = request.Skipped,
            PlannedWarmUp = request.PlannedWarmUp,
            WarmUpStartedAt = request.WarmUpStartedAt,
            WarmUpEndedAt = request.WarmUpEndedAt,
            WarmUpDuration = request.WarmUpDuration,
            SessionSets = request.SessionSets.Select(MapSessionSet).ToList(),
        };
    }

    private static SessionSet MapSessionSet(SessionSetDto request)
    {
        return new SessionSet
        {
            Uuid = request.Uuid,
            CreatedAt = request.CreatedAt,
            UpdatedAt = request.UpdatedAt,
            Reps = request.Reps,
            Weight = request.Weight,
            Rpe = request.Rpe,
            RestPeriodDuration = request.RestPeriodDuration,
            RestPeriodStartedAt = request.RestPeriodStartedAt,
            RestPeriodEndedAt = request.RestPeriodEndedAt,
            Position = request.Position,
            StartedAt = request.StartedAt,
            EndedAt = request.EndedAt,
            WarmUpStartedAt = request.WarmUpStartedAt,
            WarmUpEndedAt = request.WarmUpEndedAt,
            WarmUpDuration = request.WarmUpDuration,
        };
    }
}
