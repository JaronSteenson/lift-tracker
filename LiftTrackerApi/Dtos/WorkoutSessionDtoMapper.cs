using LiftTrackerApi.Entities;

// ReSharper disable CollectionNeverUpdated.Global
// ReSharper disable AutoPropertyCanBeMadeGetOnly.Global
// ReSharper disable UnusedAutoPropertyAccessor.Global
// ReSharper disable PropertyCanBeMadeInitOnly.Global
namespace LiftTrackerApi.Dtos;

public static class WorkoutSessionDtoMapper
{
    public static PaginatedListDto<WorkoutSessionDto> ToDto(
        PaginatedListDto<WorkoutSession> sessions
    )
    {
        return new PaginatedListDto<WorkoutSessionDto>(
            sessions.Select(ToDto).ToList(),
            sessions.TotalCount,
            sessions.PageIndex,
            sessions.PageSize
        );
    }

    public static WorkoutSessionDto ToDto(WorkoutSession session)
    {
        return new WorkoutSessionDto
        {
            Uuid = session.Uuid,
            CreatedAt = session.CreatedAt,
            UpdatedAt = session.UpdatedAt,
            Name = session.Name,
            StartedAt = session.StartedAt,
            EndedAt = session.EndedAt,
            Notes = session.Notes,
            BodyWeight = session.BodyWeight,
            WorkoutProgramRoutineUuid = session.WorkoutProgramRoutine?.Uuid,
            WorkoutProgramRoutineName = session.WorkoutProgramRoutine?.Name,
            WorkoutProgramUuid = session.WorkoutProgramRoutine?.WorkoutProgram?.Uuid,
            WorkoutProgramName = session.WorkoutProgramRoutine?.WorkoutProgram?.Name,
            SessionExercises = session.SessionExercises.Select(ToDto).ToList(),
        };
    }

    public static SessionExerciseDto ToDto(SessionExercise exercise)
    {
        return new SessionExerciseDto
        {
            Uuid = exercise.Uuid,
            WorkoutSessionUuid = exercise.WorkoutSession?.Uuid,
            CreatedAt = exercise.CreatedAt,
            UpdatedAt = exercise.UpdatedAt,
            Name = exercise.Name,
            PlannedWeight = exercise.PlannedWeight,
            PlannedRestPeriodDuration = exercise.PlannedRestPeriodDuration,
            Notes = exercise.Notes,
            Position = exercise.Position,
            Skipped = exercise.Skipped,
            PlannedWarmUp = exercise.PlannedWarmUp,
            WarmUpStartedAt = exercise.WarmUpStartedAt,
            WarmUpEndedAt = exercise.WarmUpEndedAt,
            WarmUpDuration = exercise.WarmUpDuration,
            RoutineExerciseUuid = exercise.RoutineExercise?.Uuid,
            SessionSets = exercise.SessionSets.Select(ToDto).ToList(),
        };
    }

    public static SessionExerciseStatsDto ToStatsDto(SessionExercise exercise)
    {
        return new SessionExerciseStatsDto
        {
            Uuid = exercise.Uuid,
            WorkoutSessionUuid = exercise.WorkoutSession?.Uuid,
            CreatedAt = exercise.CreatedAt,
            UpdatedAt = exercise.UpdatedAt,
            Name = exercise.Name,
            PlannedWeight = exercise.PlannedWeight,
            PlannedRestPeriodDuration = exercise.PlannedRestPeriodDuration,
            Notes = exercise.Notes,
            Position = exercise.Position,
            Skipped = exercise.Skipped,
            PlannedWarmUp = exercise.PlannedWarmUp,
            WarmUpStartedAt = exercise.WarmUpStartedAt,
            WarmUpEndedAt = exercise.WarmUpEndedAt,
            WarmUpDuration = exercise.WarmUpDuration,
            RoutineExerciseUuid = exercise.RoutineExercise?.Uuid,
            BodyWeight = exercise.WorkoutSession?.BodyWeight,
            SessionSets = exercise.SessionSets.Select(ToDto).ToList(),
        };
    }

    public static SessionSetDto ToDto(SessionSet set)
    {
        return new SessionSetDto
        {
            Uuid = set.Uuid,
            CreatedAt = set.CreatedAt,
            UpdatedAt = set.UpdatedAt,
            Reps = set.Reps,
            Weight = set.Weight,
            RestPeriodDuration = set.RestPeriodDuration,
            RestPeriodStartedAt = set.RestPeriodStartedAt,
            RestPeriodEndedAt = set.RestPeriodEndedAt,
            Position = set.Position,
            StartedAt = set.StartedAt,
            EndedAt = set.EndedAt,
            WarmUpStartedAt = set.WarmUpStartedAt,
            WarmUpEndedAt = set.WarmUpEndedAt,
            WarmUpDuration = set.WarmUpDuration,
        };
    }
}
