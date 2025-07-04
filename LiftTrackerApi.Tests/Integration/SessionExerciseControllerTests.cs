using System.Net;
using System.Text;
using FluentAssertions;
using LiftTrackerApi.Controllers;
using LiftTrackerApi.Entities;
using LiftTrackerApi.Extensions;
using LiftTrackerApi.Tests.Integration.Fixtures;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace LiftTrackerApi.Tests.Integration;

[Collection("WorkoutProgramTestCollection")]
public class SessionExerciseControllerTests(WorkoutDbFixture fixture)
    : IClassFixture<WorkoutDbFixture>
{
    private readonly HttpClient _client = fixture.Client;

    /// <see cref="WorkoutSessionController.Create(WorkoutSession)" />
    /// <see cref="SessionExerciseController.Update(SessionExercise)" />
    [Fact]
    public async Task Put_SavesExistingExercisesWithChildren()
    {
        // Arrange
        var newWorkoutSession = new WorkoutSession
        {
            Uuid = Guid.Parse("36465433-7e55-4282-9c61-761417fbcda8"),
            Name = "Deadlift day",
            UserId = 1,
            WorkoutProgramRoutine = new WorkoutProgramRoutine
            {
                Uuid = Guid.Parse("073379e9-0bc1-4f69-9cd5-1b0e7074d1a3"),
            },
            SessionExercises = new List<SessionExercise>
            {
                new()
                {
                    Uuid = Guid.Parse("0925e348-49f1-4a5f-8f27-47f4cf6ca6c3"),
                    Name = "Deadlifts",
                    Position = 0,
                    RoutineExercise = new RoutineExercise()
                    {
                        Uuid = Guid.Parse("21ba1db3-8045-473c-901d-18b19ba33fe5"),
                    },
                    SessionSets = new List<SessionSet>
                    {
                        new()
                        {
                            Uuid = Guid.Parse("1ad2a000-c179-4019-83ef-97274be42c5e"),
                            Reps = null,
                            Weight = 180,
                            Position = 0,
                            RestPeriodDuration = null,
                            RestPeriodStartedAt = null,
                            RestPeriodEndedAt = null,
                            WarmUpDuration = null,
                            WarmUpStartedAt = null,
                            WarmUpEndedAt = null,
                        },
                    },
                },
            },
        };

        var requestJson = JsonConvert.SerializeObject(newWorkoutSession);
        var content = new StringContent(requestJson, Encoding.UTF8, "application/json");

        var response = await _client.PostAsync("/workout-sessions", content);
        var json = await response.Content.ReadAsStringAsync();
        response.EnsureSuccessStatusCode();
        Assert.Equal(
            "application/json; charset=utf-8",
            response.Content.Headers.ContentType!.ToString()
        );
        var createdSession = JsonConvert.DeserializeObject<WorkoutSession>(json);

        // Act
        var exercise = createdSession!.SessionExercises.First();
        exercise.WarmUpDuration = 10;
        exercise.Notes = "This is a test note";

        var set = exercise.SessionSets.First();
        set.RestPeriodDuration = 15;
        set.Weight = 20;

        var originalPostResponse = JsonConvert.SerializeObject(exercise);
        var putContent = new StringContent(originalPostResponse, Encoding.UTF8, "application/json");
        var responseFromEdit = await _client.PutAsync("/session-exercises", putContent);

        // Assert
        await AssertSimpleSaveResponse(responseFromEdit);

        var responseFromDelete = await _client.DeleteAsync(
            "/workout-sessions/36465433-7e55-4282-9c61-761417fbcda8"
        );
        responseFromDelete.EnsureSuccessStatusCode();
        Assert.Equal(
            "application/json; charset=utf-8",
            response.Content.Headers.ContentType!.ToString()
        );
    }

    private static async Task AssertSimpleSaveResponse(HttpResponseMessage response)
    {
        var json = await response.Content.ReadAsStringAsync();
        response.EnsureSuccessStatusCode();
        Assert.Equal(
            "application/json; charset=utf-8",
            response.Content.Headers.ContentType!.ToString()
        );
        var deadlifts = JsonConvert.DeserializeObject<SessionExercise>(json);
        Assert.Equal(Guid.Parse("0925e348-49f1-4a5f-8f27-47f4cf6ca6c3"), deadlifts!.Uuid);
        Assert.Equal(0, deadlifts.Position);
        Assert.Null(deadlifts.WarmUpStartedAt);
        Assert.Null(deadlifts.WarmUpEndedAt);
        Assert.Single(deadlifts.SessionSets);

        // Edits:
        Assert.Equal(10, deadlifts.WarmUpDuration);
        Assert.Equal("This is a test note", deadlifts.Notes);

        var onlySet = deadlifts.SessionSets.First();
        Assert.Equal(Guid.Parse("1ad2a000-c179-4019-83ef-97274be42c5e"), onlySet.Uuid);
        Assert.Null(onlySet.Reps);
        Assert.Null(onlySet.RestPeriodStartedAt);
        Assert.Null(onlySet.RestPeriodEndedAt);

        // Edits:
        Assert.Equal(15, onlySet.RestPeriodDuration);
        Assert.Equal(20, onlySet.Weight);
    }

    /// <see cref="SessionExerciseController.GetHistory(Guid)" />
    [Fact]
    public async Task GetHistory_ReturnsSiblingsAndSelfOlderThanSourceExercise()
    {
        // Act
        var response = await _client.GetAsync(
            "/session-exercises/history/a85ca59d-e66c-4b19-aed1-222222222221"
        );

        // Assert
        var json = await response.Content.ReadAsStringAsync();
        response.EnsureSuccessStatusCode();
        Assert.Equal(
            "application/json; charset=utf-8",
            response.Content.Headers.ContentType!.ToString()
        );

        var history = JsonConvert.DeserializeObject<List<SessionExercise>>(json);

        Assert.Equal(6, history!.Count);
        for (int i = 0; i < history.Count; i++)
        {
            var sessionExercise = history[i];
            int j = i + 1;

            Assert.Equal(
                sessionExercise.Uuid,
                Guid.Parse($"a85ca59d-e66c-4b19-aed1-22222222222{j}")
            );
            Assert.Equal(sessionExercise.Name, $"Push Ups {j}");

            Assert.Single(sessionExercise.SessionSets);
            var sessionSet = sessionExercise.SessionSets.First();
            Assert.Equal(Guid.Parse($"b0d6a7d7-9185-4019-bdfa-33333333333{j}"), sessionSet.Uuid);
            Assert.Equal(j * 10, sessionSet.Weight);
            Assert.Equal(j, sessionSet.Reps);
        }
    }
}
