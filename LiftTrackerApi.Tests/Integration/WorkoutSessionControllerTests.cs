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
public class WorkoutSessionControllerTests(WorkoutDbFixture fixture)
    : IClassFixture<WorkoutDbFixture>
{
    private readonly HttpClient _client = fixture.Client;

    /// <see cref="WorkoutSessionController.Index()" />
    [Fact]
    public async Task Get_EndpointsReturnsEntities()
    {
        // Act
        var response = await _client.GetAsync("/api/workout-sessions");

        // Assert
        response.EnsureSuccessStatusCode();
        Assert.Equal(
            "application/json; charset=utf-8",
            response.Content.Headers.ContentType!.ToString()
        );

        var json = await response.Content.ReadAsStringAsync();
        var sessions = JsonConvert.DeserializeObject<List<WorkoutSession>>(json);

        var workoutSession = sessions!.WhereUuid("27ffe07e-ecfd-4599-b132-6ec9e35fee1d").First();

        AssertTestSessionStructure(workoutSession);
    }

    /// <see cref="WorkoutSessionController.Get(Guid)" />
    [Fact]
    public async Task Get_EndpointsReturnsSingleByUuid()
    {
        // Act
        var response = await _client.GetAsync(
            "/api/workout-sessions/27ffe07e-ecfd-4599-b132-6ec9e35fee1d"
        );

        // Assert
        response.EnsureSuccessStatusCode();
        Assert.Equal(
            "application/json; charset=utf-8",
            response.Content.Headers.ContentType!.ToString()
        );

        var json = await response.Content.ReadAsStringAsync();
        var workoutSession = JsonConvert.DeserializeObject<WorkoutSession>(json);

        Assert.NotNull(workoutSession);
        AssertTestSessionStructure(workoutSession);
    }

    /// <see cref="WorkoutSessionController.Get(Guid)" />
    [Fact]
    public async Task GetBySet_EndpointsReturnsSingle()
    {
        // Act
        var response = await _client.GetAsync(
            "/api/workout-sessions/by-set/b0d6a7d7-9185-4019-bdfa-5b0411d946ab"
        );

        // Assert
        response.EnsureSuccessStatusCode();
        Assert.Equal(
            "application/json; charset=utf-8",
            response.Content.Headers.ContentType!.ToString()
        );

        var json = await response.Content.ReadAsStringAsync();
        var workoutSession = JsonConvert.DeserializeObject<WorkoutSession>(json);

        Assert.NotNull(workoutSession);
        AssertTestSessionStructure(workoutSession);
    }

    private void AssertTestSessionStructure(WorkoutSession workoutSession)
    {
        Assert.Equal(Guid.Parse("27ffe07e-ecfd-4599-b132-6ec9e35fee1d"), workoutSession.Uuid);
        Assert.Equal("Test Workout Session", workoutSession.Name);
        Assert.Equal(1, workoutSession.UserId);

        var originWorkoutRoutine = workoutSession.WorkoutProgramRoutine;
        Assert.Equal(
            Guid.Parse("cd218127-b60d-46a7-bbc1-a17332bea15f"),
            originWorkoutRoutine!.Uuid
        );
        Assert.Equal("Populated Routine", originWorkoutRoutine.Name);

        var exercises = workoutSession.SessionExercises;
        Assert.Equal(2, exercises.Count);

        var pushUpsFirst = exercises.First();
        Assert.Equal(Guid.Parse("a85ca59d-e66c-4b19-aed1-8e041e89011f"), pushUpsFirst.Uuid);
        Assert.Equal("Push Ups", pushUpsFirst.Name);
        Assert.Equal(
            Guid.Parse("231f3f81-4680-4086-b228-168116ae330a"),
            pushUpsFirst!.RoutineExercise!.Uuid
        );
        Assert.Equal(0, pushUpsFirst.Position);

        var pushUpsSets = pushUpsFirst.SessionSets;
        Assert.Equal(2, pushUpsSets.Count);

        var pushUpsSetFirst = pushUpsSets.First();
        Assert.Equal(Guid.Parse("b0d6a7d7-9185-4019-bdfa-5b0411d946ab"), pushUpsSetFirst.Uuid);
        Assert.Equal(10, pushUpsSetFirst.Reps);
        Assert.Equal(100, pushUpsSetFirst.Weight);
        Assert.Equal(0, pushUpsSetFirst.Position);
        Assert.Equal(60, pushUpsSetFirst.RestPeriodDuration);
        Assert.Equal(DateTime.Parse("2023-10-01T12:02:00Z"), pushUpsSetFirst.RestPeriodStartedAt);
        Assert.Equal(DateTime.Parse("2023-10-01T12:03:00Z"), pushUpsSetFirst.RestPeriodEndedAt);
        Assert.Equal(0, pushUpsSetFirst.WarmUpDuration);
        Assert.Equal(DateTime.Parse("2023-10-01T12:00:00Z"), pushUpsSetFirst.WarmUpStartedAt);
        Assert.Equal(DateTime.Parse("2023-10-01T12:01:00Z"), pushUpsSetFirst.WarmUpEndedAt);

        var pushUpsSetLast = pushUpsSets.Last();
        Assert.Equal(Guid.Parse("521fff85-27f7-464c-bce8-3cc269e565bd"), pushUpsSetLast.Uuid);
        Assert.Equal(10, pushUpsSetLast.Reps);
        Assert.Equal(100, pushUpsSetLast.Weight);
        Assert.Equal(1, pushUpsSetLast.Position);
        Assert.Equal(60, pushUpsSetLast.RestPeriodDuration);
        Assert.Null(pushUpsSetLast.RestPeriodStartedAt);
        Assert.Null(pushUpsSetLast.RestPeriodEndedAt);
        Assert.Equal(0, pushUpsSetLast.WarmUpDuration);
        Assert.Null(pushUpsSetLast.WarmUpStartedAt);
        Assert.Null(pushUpsSetLast.WarmUpEndedAt);

        var squatsLast = exercises.Last();
        Assert.Equal(Guid.Parse("46bcb5d3-db0b-4e0d-9445-fd76aa3143a4"), squatsLast.Uuid);
        Assert.Equal("Squats", squatsLast.Name);
        Assert.Null(squatsLast.RoutineExercise);
        Assert.Equal(1, squatsLast.Position);

        var squatsSets = squatsLast.SessionSets;
        Assert.Single(squatsSets);
    }

    /// <see cref="WorkoutProgramController.Create(WorkoutProgram)" />
    /// <see cref="WorkoutProgramController.Update(WorkoutProgram)" />
    [Fact]
    public async Task PostPutDelete_SavesAndDeletesNewSessionsWithChildren()
    {
        // Arrange
        var newWorkoutSession = new WorkoutSession
        {
            Uuid = Guid.Parse("80412f8c-49dd-4f0e-b9b2-1021f9308106"),
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
                    Uuid = Guid.Parse("f7dcf236-0b19-4974-a6d3-0ca97c61edd6"),
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
                            Uuid = Guid.Parse("72a9339e-c625-415d-8e6d-38ec431299b4"),
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

        // Act
        var response = await _client.PostAsync("/api/workout-sessions", content);

        // Assert
        var createdSession = await AssertSimpleSaveResponse(response);
        Assert.Null(createdSession.BodyWeight);
        Assert.Null(createdSession.StartedAt);

        // Act
        // Make a couple of top-level edits to the session, like in the actual app.
        createdSession.BodyWeight = 85;
        createdSession.StartedAt = DateTime.Parse("2025-04-12");

        var originalPostResponse = JsonConvert.SerializeObject(createdSession);
        var putContent = new StringContent(originalPostResponse, Encoding.UTF8, "application/json");
        var responseFromEdit = await _client.PutAsync("/api/workout-sessions", putContent);

        // Assert
        var editedSession = await AssertSimpleSaveResponse(responseFromEdit);
        Assert.Equal(85, editedSession.BodyWeight);
        Assert.Equal(DateTime.Parse("2025-04-12"), editedSession.StartedAt);

        var responseFromDelete = await _client.DeleteAsync(
            "/api/workout-sessions/80412f8c-49dd-4f0e-b9b2-1021f9308106"
        );
        responseFromDelete.EnsureSuccessStatusCode();
        Assert.Equal(
            "application/json; charset=utf-8",
            response.Content.Headers.ContentType!.ToString()
        );
    }

    private static async Task<WorkoutSession> AssertSimpleSaveResponse(HttpResponseMessage response)
    {
        var json = await response.Content.ReadAsStringAsync();
        response.EnsureSuccessStatusCode();
        Assert.Equal(
            "application/json; charset=utf-8",
            response.Content.Headers.ContentType!.ToString()
        );
        var workoutSession = JsonConvert.DeserializeObject<WorkoutSession>(json);

        Assert.Equal("Deadlift day", workoutSession!.Name);
        Assert.Single(workoutSession.SessionExercises);

        var deadlifts = workoutSession.SessionExercises.First();
        Assert.Equal(Guid.Parse("f7dcf236-0b19-4974-a6d3-0ca97c61edd6"), deadlifts.Uuid);
        Assert.Equal(0, deadlifts.Position);
        Assert.Null(deadlifts.WarmUpDuration);
        Assert.Null(deadlifts.WarmUpStartedAt);
        Assert.Null(deadlifts.WarmUpEndedAt);
        Assert.Single(deadlifts.SessionSets);

        var onlySet = deadlifts.SessionSets.First();
        Assert.Equal(Guid.Parse("72a9339e-c625-415d-8e6d-38ec431299b4"), onlySet.Uuid);
        Assert.Null(onlySet.Reps);
        Assert.Equal(180, onlySet.Weight);
        Assert.Null(onlySet.RestPeriodDuration);
        Assert.Null(onlySet.RestPeriodStartedAt);
        Assert.Null(onlySet.RestPeriodEndedAt);

        return workoutSession;
    }
}
