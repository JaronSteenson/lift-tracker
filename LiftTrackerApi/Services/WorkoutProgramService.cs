using LiftTrackerApi.Entities;
using LiftTrackerApi.Exceptions;
using LiftTrackerApi.Extensions;
using Microsoft.EntityFrameworkCore;

namespace LiftTrackerApi.Services;

public class WorkoutProgramService(LiftTrackerDbContext db, DomainEntityService domainEntityService)
{
    public async Task<WorkoutProgramRoutine> FindRoutineByUuidAndOwner(Guid routineUuid, int userId)
    {
        var routine =
            await db
                .WorkoutProgramRoutines.Include(item => item.RoutineExercises)
                .ThenInclude(exercise => exercise.RoutineExerciseRotationGroup)
                .Include(item => item.RoutineExerciseRotationGroups)
                .Include(item => item.WorkoutProgram)
                .Where(item => item.WorkoutProgram != null && item.WorkoutProgram.UserId == userId)
                .WhereUuid(routineUuid)
                .FirstOrDefaultAsync()
            ?? throw new NotFoundException(
                $"WorkoutProgramRoutine with UUID {routineUuid} not found for user {userId}."
            );

        SortChildren(routine);
        return routine;
    }

    public async Task<RoutineExercise> FindRoutineExerciseByUuidAndOwner(Guid exerciseUuid, int userId)
    {
        return await db
                .RoutineExercises.Include(item => item.RoutineExerciseRotationGroup)
                .Include(item => item.WorkoutProgramRoutine)
                .ThenInclude(routine => routine!.WorkoutProgram)
                .Where(item =>
                    item.WorkoutProgramRoutine != null
                    && item.WorkoutProgramRoutine.WorkoutProgram != null
                    && item.WorkoutProgramRoutine.WorkoutProgram.UserId == userId
                )
                .WhereUuid(exerciseUuid)
                .FirstOrDefaultAsync()
            ?? throw new NotFoundException(
                $"RoutineExercise with UUID {exerciseUuid} not found for user {userId}."
            );
    }

    public RoutineExercise CreateProjectionExerciseOverride(
        RoutineExercise exercise,
        ProgressionScheme? progressionScheme,
        decimal? trainingMax,
        int? currentCycleWeek,
        ProgressionScheme531BodyType? bodyType
    )
    {
        var effectiveProgressionScheme = progressionScheme ?? exercise.ProgressionScheme;
        var settings =
            effectiveProgressionScheme == ProgressionScheme.FiveThreeOne
                ? new ProgressionScheme531Settings
                {
                    CurrentCycleWeek =
                        currentCycleWeek
                        ?? exercise.ProgressionSchemeSettings?.CurrentCycleWeek
                        ?? 1,
                    BodyType =
                        bodyType
                        ?? exercise.ProgressionSchemeSettings?.BodyType
                        ?? ProgressionScheme531BodyType.Upper,
                }
                : null;

        return new RoutineExercise
        {
            Uuid = exercise.Uuid,
            Name = exercise.Name,
            NumberOfSets = exercise.NumberOfSets,
            ProgressionScheme = effectiveProgressionScheme,
            ProgressionSchemeSettings = settings,
            Position = exercise.Position,
            Weight = trainingMax ?? exercise.Weight,
            Rpe = exercise.Rpe,
            RestPeriod = exercise.RestPeriod,
            WarmUp = exercise.WarmUp,
        };
    }

    public async Task<object?> FindWorkoutProgramByRoutineUuid(Guid routineUuid, int userId)
    {
        var query = db
            .WorkoutPrograms.Include(workoutProgram => workoutProgram.WorkoutProgramRoutines)
            .ThenInclude(routine => routine.RoutineExercises)
            .ThenInclude(exercise => exercise.RoutineExerciseRotationGroup)
            .Include(workoutProgram => workoutProgram.WorkoutProgramRoutines)
            .ThenInclude(routine => routine.RoutineExerciseRotationGroups)
            .Where(workoutProgram => workoutProgram.UserId == userId)
            .Where(workoutProgram =>
                workoutProgram.WorkoutProgramRoutines.Any(routine => routine.Uuid == routineUuid)
            );

        var workoutProgram = await query.AsNoTracking().FirstOrDefaultAsync();

        if (workoutProgram == null)
            return null;

        SortChildren(workoutProgram);
        return workoutProgram;
    }

    public async Task<List<WorkoutProgram>> FindWorkoutProgramsForUserId(int userId)
    {
        var query = db
            .WorkoutPrograms.Include(workoutProgram => workoutProgram.WorkoutProgramRoutines)
            .ThenInclude(routine => routine.RoutineExercises)
            .ThenInclude(exercise => exercise.RoutineExerciseRotationGroup)
            .Include(workoutProgram => workoutProgram.WorkoutProgramRoutines)
            .ThenInclude(routine => routine.RoutineExerciseRotationGroups)
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
                .ThenInclude(exercise => exercise.RoutineExerciseRotationGroup)
                .Include(workoutProgram => workoutProgram.WorkoutProgramRoutines)
                .ThenInclude(routine => routine.RoutineExerciseRotationGroups)
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
            .ThenInclude(exercise => exercise.RoutineExerciseRotationGroup)
            .Include(routine => routine.RoutineExerciseRotationGroups)
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
        BindRotationGroupMemberships(newWorkoutProgram);

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
        BindRotationGroupMemberships(updated);

        domainEntityService.ReattachRequestEntity(existing: existing, updated: updated);
        domainEntityService.TrackEntityDiffChanges(
            existingMap: ToRoutineMap(existing),
            updatedMap: ToRoutineMap(updated)
        );
        domainEntityService.TrackEntityDiffChanges(
            existingMap: ToRotationGroupMap(existing),
            updatedMap: ToRotationGroupMap(updated)
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

    private Dictionary<Guid, RoutineExerciseRotationGroup> ToRotationGroupMap(WorkoutProgram program)
    {
        return program
            .WorkoutProgramRoutines.SelectMany(routine => routine.RoutineExerciseRotationGroups)
            .ToDictionary(group => group.Uuid ?? Guid.Empty);
    }

    private async Task VerifyOrAssignNewUuids(WorkoutProgram workoutProgram)
    {
        await domainEntityService.VerifyOrAssignNewEntityUuid(workoutProgram);
        foreach (var routine in workoutProgram.WorkoutProgramRoutines)
        {
            await domainEntityService.VerifyOrAssignNewEntityUuid(routine);
            foreach (var rotationGroup in routine.RoutineExerciseRotationGroups)
            {
                await domainEntityService.VerifyOrAssignNewEntityUuid(rotationGroup);
            }
            foreach (var exercise in routine.RoutineExercises)
            {
                await domainEntityService.VerifyOrAssignNewEntityUuid(exercise);
            }
        }
    }

    private static void BindRotationGroupMemberships(WorkoutProgram workoutProgram)
    {
        foreach (var routine in workoutProgram.WorkoutProgramRoutines)
        {
            routine.RoutineExerciseRotationGroups = routine.RoutineExerciseRotationGroups
                .Where(group =>
                    routine.RoutineExercises.Any(exercise => exercise.RotationGroupUuid == group.Uuid)
                )
                .ToList();

            var groupsByUuid = routine.RoutineExerciseRotationGroups.ToDictionary(
                group => group.Uuid ?? Guid.Empty
            );

            foreach (var exercise in routine.RoutineExercises)
            {
                if (!exercise.RotationGroupUuid.HasValue)
                {
                    exercise.RoutineExerciseRotationGroup = null;
                    exercise.RoutineExerciseRotationGroupId = null;
                    exercise.RotationGroupPosition = null;
                    continue;
                }

                var rotationGroupUuid = exercise.RotationGroupUuid.Value;
                if (!groupsByUuid.TryGetValue(rotationGroupUuid, out var rotationGroup))
                {
                    throw new ArgumentException(
                        $"RoutineExercise rotation group {rotationGroupUuid} was not found on routine {routine.Uuid}."
                    );
                }

                exercise.RoutineExerciseRotationGroup = rotationGroup;
            }

            routine.RoutineExerciseRotationGroups = routine.RoutineExerciseRotationGroups
                .Select(group =>
                {
                    var memberCount = routine.RoutineExercises.Count(exercise =>
                        exercise.RotationGroupUuid == group.Uuid
                    );

                    if (memberCount == 0)
                    {
                        group.NextExerciseIndex = 0;
                        return group;
                    }

                    group.NextExerciseIndex =
                        group.NextExerciseIndex < 0
                            ? 0
                            : group.NextExerciseIndex % memberCount;
                    return group;
                })
                .ToList();
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
            SortChildren(workoutProgramRoutine);
    }

    private void SortChildren(WorkoutProgramRoutine workoutProgramRoutine)
    {
        workoutProgramRoutine.RoutineExercises = workoutProgramRoutine
            .RoutineExercises.OrderByPosition()
            .ToList();

        workoutProgramRoutine.RoutineExerciseRotationGroups = workoutProgramRoutine
            .RoutineExerciseRotationGroups.OrderBy(group =>
                group.RoutineExercises
                    .Select(exercise => exercise.Position)
                    .DefaultIfEmpty(int.MaxValue)
                    .Min()
            )
            .ThenBy(group => group.CreatedAt)
            .ThenBy(group => group.Id)
            .ToList();

        foreach (var exercise in workoutProgramRoutine.RoutineExercises)
        {
            exercise.RotationGroupUuid = exercise.RoutineExerciseRotationGroup?.Uuid;
        }
    }
}
