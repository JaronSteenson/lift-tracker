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
public class SessionSetControllerTests(WorkoutDbFixture fixture) : IClassFixture<WorkoutDbFixture>
{
    private readonly HttpClient _client = fixture.Client;

    /// <see cref="WorkoutSessionController.Create(WorkoutSession)" />
    /// <see cref="SessionSetController.Update(SessionSet)" />
    [Fact]
    public async Task Put_SavesExistingSetWithChildren()
    {
        // Arrange
        var newWorkoutSession = new WorkoutSession
        {
            Uuid = Guid.Parse("1e50d5a5-7328-4983-be4a-489a5e377261"),
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
                    Uuid = Guid.Parse("32174bcd-b2eb-4b70-8e31-fbe10afffafb"),
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
                            Uuid = Guid.Parse("dfe86f39-0db7-4ded-9504-7a5cfc41f788"),
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

        var response = await _client.PostAsync("/api/workout-sessions", content);
        var json = await response.Content.ReadAsStringAsync();
        response.EnsureSuccessStatusCode();
        Assert.Equal(
            "application/json; charset=utf-8",
            response.Content.Headers.ContentType!.ToString()
        );
        var createdSession = JsonConvert.DeserializeObject<WorkoutSession>(json);

        // Act
        var set = createdSession!.SessionExercises.First().SessionSets.First();
        set.StartedAt = DateTime.Parse("2023-10-01T12:02:00Z");
        set.Reps = 6;

        var originalPostResponse = JsonConvert.SerializeObject(set);
        var putContent = new StringContent(originalPostResponse, Encoding.UTF8, "application/json");
        var responseFromEdit = await _client.PutAsync("/api/session-sets", putContent);

        // Assert
        await AssertSimpleSaveResponse(responseFromEdit);

        var responseFromDelete = await _client.DeleteAsync(
            "/api/workout-sessions/1e50d5a5-7328-4983-be4a-489a5e377261"
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
        var onlySet = JsonConvert.DeserializeObject<SessionSet>(json);
        Assert.Equal(Guid.Parse("dfe86f39-0db7-4ded-9504-7a5cfc41f788"), onlySet!.Uuid);
        Assert.Null(onlySet.RestPeriodStartedAt);
        Assert.Null(onlySet.RestPeriodEndedAt);
        Assert.Null(onlySet.RestPeriodDuration);
        Assert.Equal(180, onlySet.Weight);

        // Edits:
        Assert.Equal(DateTime.Parse("2023-10-01T12:02:00Z"), onlySet.StartedAt);
        Assert.Equal(6, onlySet.Reps);
    }
}
