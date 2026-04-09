using System.Net;
using System.Text;
using FluentAssertions;
using LiftTrackerApi.Controllers;
using LiftTrackerApi.Dtos;
using LiftTrackerApi.Entities;
using LiftTrackerApi.Tests.Integration.Fixtures;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
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
        var sessions = JsonConvert.DeserializeObject<List<WorkoutSessionDto>>(json);

        var workoutSession = sessions!
            .First(session => session.Uuid == Guid.Parse("27ffe07e-ecfd-4599-b132-6ec9e35fee1d"));

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
        var workoutSession = JsonConvert.DeserializeObject<WorkoutSessionDto>(json);

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
        var workoutSession = JsonConvert.DeserializeObject<WorkoutSessionDto>(json);

        Assert.NotNull(workoutSession);
        AssertTestSessionStructure(workoutSession);
    }

    private void AssertTestSessionStructure(WorkoutSessionDto workoutSession)
    {
        Assert.Equal(Guid.Parse("27ffe07e-ecfd-4599-b132-6ec9e35fee1d"), workoutSession.Uuid);
        Assert.Equal("Test Workout Session", workoutSession.Name);
        Assert.Equal(
            Guid.Parse("cd218127-b60d-46a7-bbc1-a17332bea15f"),
            workoutSession.WorkoutProgramRoutineUuid
        );
        Assert.Equal("Populated Routine", workoutSession.WorkoutProgramRoutineName);

        var exercises = workoutSession.SessionExercises;
        Assert.Equal(2, exercises.Count);

        var pushUpsFirst = exercises.First();
        Assert.Equal(Guid.Parse("a85ca59d-e66c-4b19-aed1-8e041e89011f"), pushUpsFirst.Uuid);
        Assert.Equal("Push Ups", pushUpsFirst.Name);
        Assert.Equal(
            Guid.Parse("231f3f81-4680-4086-b228-168116ae330a"),
            pushUpsFirst.RoutineExerciseUuid
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
        Assert.Null(squatsLast.RoutineExerciseUuid);
        Assert.Equal(1, squatsLast.Position);

        var squatsSets = squatsLast.SessionSets;
        Assert.Single(squatsSets);
    }

    /// <see cref="WorkoutProgramController.Create(WorkoutProgram)" />
    /// <see cref="WorkoutProgramController.Update(WorkoutProgram)" />
    [Fact]
    public async Task Post_StartsWorkoutFromRoutineExerciseLinks_WithoutCreatingBlankRoutineExercises()
    {
        int routineExerciseCountBefore;
        using (var beforeScope = fixture.Factory.Services.CreateScope())
        {
            var beforeDb = beforeScope.ServiceProvider.GetRequiredService<LiftTrackerDbContext>();
            routineExerciseCountBefore = await beforeDb
                .RoutineExercises.IgnoreQueryFilters()
                .CountAsync();
        }

        var newWorkoutSession = new
        {
            Uuid = Guid.Parse("924f6e65-1f15-43b6-aaf0-e85c9ba5f413"),
            Name = "Push day",
            WorkoutProgramRoutineUuid = Guid.Parse("cd218127-b60d-46a7-bbc1-a17332bea15f"),
            SessionExercises = new[]
            {
                new
                {
                    Uuid = Guid.Parse("f650b2c0-df53-4fe0-9caf-98789824b5c5"),
                    Name = "Push Ups",
                    Position = 0,
                    RoutineExerciseUuid = Guid.Parse("231f3f81-4680-4086-b228-168116ae330a"),
                    SessionSets = new[]
                    {
                        new
                        {
                            Uuid = Guid.Parse("88d4eb24-33fe-452c-9700-96c3ecad82a9"),
                            Reps = 12m,
                            Weight = 50m,
                            Position = 0,
                        },
                    },
                },
            },
        };

        var requestJson = JsonConvert.SerializeObject(newWorkoutSession);
        var content = new StringContent(requestJson, Encoding.UTF8, "application/json");

        var response = await _client.PostAsync("/api/workout-sessions", content);

        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        var createdSession = JsonConvert.DeserializeObject<WorkoutSessionDto>(json);

        Assert.NotNull(createdSession);
        Assert.Equal(
            Guid.Parse("cd218127-b60d-46a7-bbc1-a17332bea15f"),
            createdSession!.WorkoutProgramRoutineUuid
        );

        var createdExercise = Assert.Single(createdSession.SessionExercises);
        Assert.Equal(
            Guid.Parse("231f3f81-4680-4086-b228-168116ae330a"),
            createdExercise.RoutineExerciseUuid
        );

        using var afterScope = fixture.Factory.Services.CreateScope();
        var afterDb = afterScope.ServiceProvider.GetRequiredService<LiftTrackerDbContext>();
        var routineExerciseCountAfter = await afterDb.RoutineExercises.IgnoreQueryFilters().CountAsync();
        routineExerciseCountAfter.Should().Be(routineExerciseCountBefore);

        var blankRoutineExercises = await afterDb
            .RoutineExercises.IgnoreQueryFilters()
            .Where(exercise => string.IsNullOrWhiteSpace(exercise.Name))
            .ToListAsync();
        blankRoutineExercises.Should().BeEmpty();
    }

    /// <see cref="WorkoutProgramController.Create(WorkoutProgram)" />
    /// <see cref="WorkoutProgramController.Update(WorkoutProgram)" />
    [Fact]
    public async Task PostPutDelete_SavesAndDeletesNewSessionsWithChildren()
    {
        // Arrange
        var newWorkoutSession = new
        {
            Uuid = Guid.Parse("80412f8c-49dd-4f0e-b9b2-1021f9308106"),
            Name = "Check in",
            WorkoutProgramRoutineUuid = (Guid?)null,
            SessionExercises = Array.Empty<object>(),
        };

        var requestJson = JsonConvert.SerializeObject(newWorkoutSession);
        var content = new StringContent(requestJson, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/workout-sessions", content);

        // Assert
        var createdSession = await AssertSimpleCreateResponse(response);
        Assert.Null(createdSession.WorkoutProgramRoutineUuid);
        Assert.Null(createdSession.BodyWeight);
        Assert.Null(createdSession.StartedAt);

        // Act
        // Make a couple of top-level edits to the session, like in the actual app.
        createdSession.BodyWeight = 85;
        createdSession.Name = "Deadlift day";
        createdSession.StartedAt = DateTime.Parse("2025-04-12");
        var originalPostResponse = JsonConvert.SerializeObject(
            new
            {
                createdSession.Uuid,
                createdSession.CreatedAt,
                createdSession.UpdatedAt,
                Name = "Deadlift day",
                createdSession.Notes,
                BodyWeight = 85m,
                StartedAt = DateTime.Parse("2025-04-12"),
                createdSession.EndedAt,
                WorkoutProgramRoutineUuid = Guid.Parse("073379e9-0bc1-4f69-9cd5-1b0e7074d1a3"),
                SessionExercises = new[]
                {
                    new
                    {
                        Uuid = Guid.Parse("f7dcf236-0b19-4974-a6d3-0ca97c61edd6"),
                        Name = "Deadlifts",
                        Position = 0,
                        RoutineExerciseUuid = Guid.Parse(
                            "231f3f81-4680-4086-b228-168116ae330a"
                        ),
                        SessionSets = new[]
                        {
                            new
                            {
                                Uuid = Guid.Parse("72a9339e-c625-415d-8e6d-38ec431299b4"),
                                Reps = (decimal?)null,
                                Weight = 180m,
                                Position = 0,
                                RestPeriodDuration = (int?)null,
                                RestPeriodStartedAt = (DateTime?)null,
                                RestPeriodEndedAt = (DateTime?)null,
                                WarmUpDuration = (int?)null,
                                WarmUpStartedAt = (DateTime?)null,
                                WarmUpEndedAt = (DateTime?)null,
                            },
                        },
                    },
                },
            }
        );
        var putContent = new StringContent(originalPostResponse, Encoding.UTF8, "application/json");
        var responseFromEdit = await _client.PutAsync("/api/workout-sessions", putContent);

        // Assert
        var editedSession = await AssertSimpleEditResponse(responseFromEdit);
        Assert.Equal(85, editedSession.BodyWeight);
        Assert.Equal(DateTime.Parse("2025-04-12"), editedSession.StartedAt);
        Assert.Equal(
            Guid.Parse("073379e9-0bc1-4f69-9cd5-1b0e7074d1a3"),
            editedSession.WorkoutProgramRoutineUuid
        );
        Assert.Equal("Empty First Routine", editedSession.WorkoutProgramRoutineName);
        var sourceExercise = editedSession.SessionExercises.First();
        Assert.Equal(
            Guid.Parse("231f3f81-4680-4086-b228-168116ae330a"),
            sourceExercise.RoutineExerciseUuid
        );

        var responseFromDelete = await _client.DeleteAsync(
            "/api/workout-sessions/80412f8c-49dd-4f0e-b9b2-1021f9308106"
        );
        responseFromDelete.EnsureSuccessStatusCode();
        Assert.Equal(
            "application/json; charset=utf-8",
            response.Content.Headers.ContentType!.ToString()
        );
    }

    /// <see cref="WorkoutProgramController.Create(WorkoutProgram)" />
    /// <see cref="WorkoutProgramController.Update(WorkoutProgram)" />
    [Fact]
    public async Task PostPutDelete_SavesAndDeletesWeightRecordingsWithoutChildren()
    {
        // Arrange
        var newWorkoutSession = new
        {
            Uuid = Guid.Parse("64014462-91c0-447f-a1dc-d6da88754ad1"),
            Name = "Weight recording",
            Notes = "Feeling heavy today",
            SessionExercises = Array.Empty<object>(),
        };

        var requestJson = JsonConvert.SerializeObject(newWorkoutSession);
        var content = new StringContent(requestJson, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/workout-sessions", content);

        // Assert
        var json = await response.Content.ReadAsStringAsync();
        var createdSession = JsonConvert.DeserializeObject<WorkoutSessionDto>(json);
        Assert.NotNull(createdSession);
        Assert.Null(createdSession.BodyWeight);
        Assert.Null(createdSession.StartedAt);
        Assert.Equal("Weight recording", createdSession.Name);
        Assert.Equal("Feeling heavy today", createdSession.Notes);
        Assert.Null(createdSession.WorkoutProgramRoutineUuid);

        // Act
        var originalPostResponse = JsonConvert.SerializeObject(
            new
            {
                createdSession!.Uuid,
                createdSession.CreatedAt,
                createdSession.UpdatedAt,
                createdSession.Name,
                createdSession.Notes,
                BodyWeight = 85m,
                createdSession.StartedAt,
                createdSession.EndedAt,
                createdSession.WorkoutProgramRoutineUuid,
                SessionExercises = Array.Empty<object>(),
            }
        );
        var putContent = new StringContent(originalPostResponse, Encoding.UTF8, "application/json");
        var responseFromEdit = await _client.PutAsync("/api/workout-sessions", putContent);

        // Assert
        response.EnsureSuccessStatusCode();
        Assert.Equal(
            "application/json; charset=utf-8",
            response.Content.Headers.ContentType!.ToString()
        );
        var jsonEdited = await responseFromEdit.Content.ReadAsStringAsync();
        var editedSession = JsonConvert.DeserializeObject<WorkoutSessionDto>(jsonEdited);
        Assert.NotNull(editedSession);
        Assert.Equal(85, editedSession.BodyWeight);

        var responseFromDelete = await _client.DeleteAsync(
            "/api/workout-sessions/64014462-91c0-447f-a1dc-d6da88754ad1"
        );
        responseFromDelete.EnsureSuccessStatusCode();
        Assert.Equal(
            "application/json; charset=utf-8",
            response.Content.Headers.ContentType!.ToString()
        );
    }

    private static async Task<WorkoutSessionDto> AssertSimpleCreateResponse(
        HttpResponseMessage response
    )
    {
        var json = await response.Content.ReadAsStringAsync();
        response.EnsureSuccessStatusCode();
        Assert.Equal(
            "application/json; charset=utf-8",
            response.Content.Headers.ContentType!.ToString()
        );
        var workoutSession = JsonConvert.DeserializeObject<WorkoutSessionDto>(json);

        Assert.Equal("Check in", workoutSession!.Name);
        Assert.Empty(workoutSession.SessionExercises);

        return workoutSession;
    }

    private static async Task<WorkoutSessionDto> AssertSimpleEditResponse(
        HttpResponseMessage response
    )
    {
        var json = await response.Content.ReadAsStringAsync();
        response.EnsureSuccessStatusCode();
        Assert.Equal(
            "application/json; charset=utf-8",
            response.Content.Headers.ContentType!.ToString()
        );
        var workoutSession = JsonConvert.DeserializeObject<WorkoutSessionDto>(json);

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
