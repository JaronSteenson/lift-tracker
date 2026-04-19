using System.Net;
using FluentAssertions;
using LiftTrackerApi.Dtos;
using LiftTrackerApi.Entities;
using LiftTrackerApi.Extensions;
using LiftTrackerApi.Tests.Integration.Fixtures;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace LiftTrackerApi.Tests.Integration;

[Collection("WorkoutProgramTestCollection")]
public class ExerciseControllerTests(WorkoutDbFixture fixture) : IClassFixture<WorkoutDbFixture>
{
    private readonly HttpClient _client = fixture.Client;
    private readonly WorkoutDbFixture _fixture = fixture;

    [Fact]
    public async Task GetCycleProjection_ReturnsProjectedFourWeekCycle()
    {
        var exerciseUuid = Guid.Parse("231f3f81-4680-4086-b228-168116ae330a");
        var originalExercise = await ConfigureFiveThreeOneExercise(
            exerciseUuid,
            100m,
            1,
            ProgressionScheme531BodyType.Upper
        );

        try
        {
            var response = await _client.GetAsync(
                "/api/exercise/231f3f81-4680-4086-b228-168116ae330a/cycle-projection?trainingMax=102.5&currentCycleWeek=3&bodyType=2"
            );

            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            var projection = JsonConvert.DeserializeObject<ExerciseCycleProjectionDto>(json);

            projection.Should().NotBeNull();
            projection!.ProgressionScheme.Should().Be(ProgressionScheme.FiveThreeOne);
            projection.Weeks.Should().HaveCount(4);
            projection.Weeks[2].Week.Should().Be(3);
            projection.Weeks[2].Sets.Select(set => set.Weight).Should().Equal(77.5m, 87.5m, 97.5m);
            projection.Weeks[2].Sets.Select(set => set.Reps).Should().Equal(5m, 3m, 1m);
        }
        finally
        {
            await RestoreFiveThreeOneExercise(exerciseUuid, originalExercise);
        }
    }

    [Fact]
    public async Task GetCycleProjection_ReturnsBadRequest_ForNonFiveThreeOneExercise()
    {
        var response = await _client.GetAsync(
            "/api/exercise/231f3f81-4680-4086-b228-168116ae330a/cycle-projection"
        );

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetCycleProjection_AcceptsProgressionSchemeOverride_ForExistingExercise()
    {
        var response = await _client.GetAsync(
            "/api/exercise/231f3f81-4680-4086-b228-168116ae330a/cycle-projection?progressionScheme=1&trainingMax=100&currentCycleWeek=1&bodyType=1"
        );

        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        var projection = JsonConvert.DeserializeObject<ExerciseCycleProjectionDto>(json);

        projection.Should().NotBeNull();
        projection!.ProgressionScheme.Should().Be(ProgressionScheme.FiveThreeOne);
        projection.Weeks.Should().HaveCount(4);
    }

    private async Task<(decimal? Weight, ProgressionScheme? Scheme, ProgressionScheme531Settings? Settings)> ConfigureFiveThreeOneExercise(
        Guid exerciseUuid,
        decimal trainingMax,
        int currentCycleWeek,
        ProgressionScheme531BodyType bodyType
    )
    {
        using var scope = _fixture.Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<LiftTrackerDbContext>();
        var exercise = await db.RoutineExercises.WhereUuid(exerciseUuid).FirstAsync();
        var original = (
            exercise.Weight,
            exercise.ProgressionScheme,
            exercise.ProgressionSchemeSettings == null
                ? null
                : new ProgressionScheme531Settings
                {
                    CurrentCycleWeek = exercise.ProgressionSchemeSettings.CurrentCycleWeek,
                    BodyType = exercise.ProgressionSchemeSettings.BodyType,
                }
        );
        exercise.Weight = trainingMax;
        exercise.ProgressionScheme = ProgressionScheme.FiveThreeOne;
        exercise.ProgressionSchemeSettings = new ProgressionScheme531Settings
        {
            CurrentCycleWeek = currentCycleWeek,
            BodyType = bodyType,
        };
        await db.SaveChangesAsync();
        return original;
    }

    private async Task RestoreFiveThreeOneExercise(
        Guid exerciseUuid,
        (decimal? Weight, ProgressionScheme? Scheme, ProgressionScheme531Settings? Settings) originalExercise
    )
    {
        using var scope = _fixture.Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<LiftTrackerDbContext>();
        var exercise = await db.RoutineExercises.WhereUuid(exerciseUuid).FirstAsync();
        exercise.Weight = originalExercise.Weight;
        exercise.ProgressionScheme = originalExercise.Scheme;
        exercise.ProgressionSchemeSettings = originalExercise.Settings == null
            ? null
            : new ProgressionScheme531Settings
            {
                CurrentCycleWeek = originalExercise.Settings.CurrentCycleWeek,
                BodyType = originalExercise.Settings.BodyType,
            };
        await db.SaveChangesAsync();
    }
}
