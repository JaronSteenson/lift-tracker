using LiftTrackerApi.Dtos;
using LiftTrackerApi.Entities;

namespace LiftTrackerApi.Services;

public class FiveThreeOneProgressionStrategy : IProgressionSchemeStrategy
{
    private sealed record SchemeSet(decimal Percentage, decimal Reps, bool IsAmrap = false);

    private sealed record SchemeWeek(int Week, string Label, IReadOnlyList<SchemeSet> Sets);

    private static readonly IReadOnlyList<SchemeWeek> CycleWeeks =
    [
        new(
            1,
            "Week 1",
            [new SchemeSet(0.65m, 5), new SchemeSet(0.75m, 5), new SchemeSet(0.85m, 5, true)]
        ),
        new(
            2,
            "Week 2",
            [new SchemeSet(0.70m, 3), new SchemeSet(0.80m, 3), new SchemeSet(0.90m, 3, true)]
        ),
        new(
            3,
            "Week 3",
            [new SchemeSet(0.75m, 5), new SchemeSet(0.85m, 3), new SchemeSet(0.95m, 1, true)]
        ),
        new(
            4,
            "Week 4",
            [new SchemeSet(0.40m, 5), new SchemeSet(0.50m, 5), new SchemeSet(0.60m, 5)]
        ),
    ];

    public ProgressionScheme Scheme => ProgressionScheme.FiveThreeOne;

    public ExerciseCycleProjectionDto CreateProjection(RoutineExercise routineExercise)
    {
        var trainingMax = GetRequiredTrainingMax(routineExercise);

        return new ExerciseCycleProjectionDto
        {
            ExerciseUuid = routineExercise.Uuid,
            ProgressionScheme = routineExercise.ProgressionScheme,
            Weeks = CycleWeeks
                .Select(week => new ExerciseCycleProjectionWeekDto
                {
                    Week = week.Week,
                    Label = week.Label,
                    Sets = week.Sets
                        .Select((set, index) => new ExerciseCycleProjectionSetDto
                        {
                            Position = index,
                            Percentage = set.Percentage,
                            Reps = set.Reps,
                            IsAmrap = set.IsAmrap,
                            Weight = RoundToNearestTwoPointFive(trainingMax * set.Percentage),
                        })
                        .ToList(),
                })
                .ToList(),
        };
    }

    public SessionExercise CreateSessionExercise(RoutineExercise routineExercise)
    {
        var settings = GetRequiredSettings(routineExercise);
        var projectedWeek = CreateProjection(routineExercise).Weeks.First(
            week => week.Week == settings.CurrentCycleWeek
        );

        return new SessionExercise
        {
            Name = routineExercise.Name ?? "Unnamed exercise",
            PlannedWeight = projectedWeek.Sets.LastOrDefault()?.Weight,
            ProgressionScheme = routineExercise.ProgressionScheme,
            PlannedRpe = routineExercise.Rpe,
            PlannedRestPeriodDuration = routineExercise.RestPeriod,
            Position = routineExercise.Position,
            PlannedWarmUp = routineExercise.WarmUp,
            WarmUpDuration = routineExercise.WarmUp,
            Skipped = false,
            SessionSets = projectedWeek.Sets
                .Select(set => new SessionSet
                {
                    Position = set.Position,
                    Weight = set.Weight,
                    Reps = set.Reps,
                    Rpe = routineExercise.Rpe,
                    RestPeriodDuration = routineExercise.RestPeriod,
                })
                .ToList(),
        };
    }

    public void Advance(RoutineExercise routineExercise)
    {
        var settings = GetRequiredSettings(routineExercise);
        var trainingMax = GetRequiredTrainingMax(routineExercise);

        if (settings.CurrentCycleWeek == 4)
        {
            settings.CurrentCycleWeek = 1;
            routineExercise.Weight =
                trainingMax
                + (settings.BodyType == ProgressionScheme531BodyType.Upper ? 2.5m : 5m);
            return;
        }

        settings.CurrentCycleWeek += 1;
    }

    private static ProgressionScheme531Settings GetRequiredSettings(RoutineExercise routineExercise)
    {
        if (routineExercise.ProgressionScheme != ProgressionScheme.FiveThreeOne)
        {
            throw new ArgumentException("Routine exercise is not configured for 531 progression.");
        }

        if (
            routineExercise.ProgressionSchemeSettings?.CurrentCycleWeek == null
            || routineExercise.ProgressionSchemeSettings.BodyType == null
        )
        {
            throw new ArgumentException("Routine exercise has invalid 531 progression settings.");
        }

        return routineExercise.ProgressionSchemeSettings;
    }

    private static decimal GetRequiredTrainingMax(RoutineExercise routineExercise)
    {
        if (routineExercise.Weight == null)
        {
            throw new ArgumentException("Routine exercise requires a training max for 531 progression.");
        }

        return routineExercise.Weight.Value;
    }

    private static decimal RoundToNearestTwoPointFive(decimal value)
    {
        return decimal.Round(value / 2.5m, 0, MidpointRounding.AwayFromZero) * 2.5m;
    }
}
