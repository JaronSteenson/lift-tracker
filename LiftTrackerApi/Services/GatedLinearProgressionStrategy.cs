using LiftTrackerApi.Dtos;
using LiftTrackerApi.Entities;

namespace LiftTrackerApi.Services;

public class GatedLinearProgressionStrategy : IProgressionSchemeStrategy
{
    public ProgressionScheme Scheme => ProgressionScheme.GatedLinear;

    public ExerciseCycleProjectionDto CreateProjection(RoutineExercise routineExercise)
    {
        throw new ArgumentException("Cycle projection is not available for gated linear progression.");
    }

    public SessionExercise CreateSessionExercise(RoutineExercise routineExercise)
    {
        GetRequiredSettings(routineExercise);
        var weight = GetRequiredWeight(routineExercise);

        return new SessionExercise
        {
            Name = routineExercise.Name ?? "Unnamed exercise",
            PlannedWeight = weight,
            ProgressionScheme = routineExercise.ProgressionScheme,
            PlannedRpe = routineExercise.Rpe,
            PlannedRestPeriodDuration = routineExercise.RestPeriod,
            Position = routineExercise.Position,
            PlannedWarmUp = routineExercise.WarmUp,
            WarmUpDuration = routineExercise.WarmUp,
            Skipped = false,
            SessionSets = Enumerable
                .Range(0, routineExercise.NumberOfSets ?? 1)
                .Select(index => new SessionSet
                {
                    Position = index,
                    Weight = weight,
                    Rpe = routineExercise.Rpe,
                    RestPeriodDuration = routineExercise.RestPeriod,
                })
                .ToList(),
        };
    }

    public void Advance(SessionExercise sessionExercise, RoutineExercise routineExercise)
    {
        var settings = GetRequiredSettings(routineExercise);
        var currentWeight = GetRequiredWeight(routineExercise);

        if (!DidSessionExerciseMeetGate(sessionExercise, settings, currentWeight))
        {
            settings.CurrentSuccessStreak = 0;
            return;
        }

        settings.CurrentSuccessStreak += 1;
        if (settings.CurrentSuccessStreak < settings.RequiredSuccessStreak)
        {
            return;
        }

        routineExercise.Weight = currentWeight + settings.IncrementBy;
        settings.CurrentSuccessStreak = 0;
    }

    private static bool DidSessionExerciseMeetGate(
        SessionExercise sessionExercise,
        ProgressionSchemeGatedLinearSettings settings,
        decimal currentWeight
    )
    {
        return sessionExercise.SessionSets.Count != 0
            && sessionExercise.SessionSets.All(set => DidSetMeetGate(set, settings, currentWeight));
    }

    private static bool DidSetMeetGate(
        SessionSet sessionSet,
        ProgressionSchemeGatedLinearSettings settings,
        decimal currentWeight
    )
    {
        if (settings.TargetRpe != null && (sessionSet.Rpe == null || sessionSet.Rpe > settings.TargetRpe))
        {
            return false;
        }

        if (
            settings.TargetReps != null
            && (sessionSet.Reps == null || sessionSet.Reps < settings.TargetReps)
        )
        {
            return false;
        }

        if (settings.UseWeightGate && (sessionSet.Weight == null || sessionSet.Weight < currentWeight))
        {
            return false;
        }

        return true;
    }

    private static ProgressionSchemeGatedLinearSettings GetRequiredSettings(
        RoutineExercise routineExercise
    )
    {
        if (routineExercise.ProgressionScheme != ProgressionScheme.GatedLinear)
        {
            throw new ArgumentException(
                "Routine exercise is not configured for gated linear progression."
            );
        }

        if (
            routineExercise.ProgressionSchemeSettings is not ProgressionSchemeGatedLinearSettings settings
            || settings.RequiredSuccessStreak == null
            || settings.IncrementBy == null
        )
        {
            throw new ArgumentException(
                "Routine exercise has invalid gated linear progression settings."
            );
        }

        return settings;
    }

    private static decimal GetRequiredWeight(RoutineExercise routineExercise)
    {
        if (routineExercise.Weight == null)
        {
            throw new ArgumentException(
                "Routine exercise requires a weight for gated linear progression."
            );
        }

        return routineExercise.Weight.Value;
    }
}
