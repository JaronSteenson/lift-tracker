using System.Net;
using System.Text;
using FluentAssertions;
using LiftTrackerApi.Controllers;
using LiftTrackerApi.Dtos;
using LiftTrackerApi.Entities;
using LiftTrackerApi.Extensions;
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
        var sessions =
            JsonConvert.DeserializeObject<PaginatedListDto<WorkoutSessionDto>>(json);

        Assert.NotNull(sessions);
        Assert.NotEmpty(sessions!.Items);

        var workoutSession = sessions.Items
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

    /// <see cref="WorkoutSessionController.GetInProgress()" />
    [Fact]
    public async Task GetInProgress_ReturnsNull_WhenNoActiveWorkoutExists()
    {
        await RemoveInProgressWorkoutSessions();

        var response = await _client.GetAsync("/api/workout-sessions/in-progress");

        response.EnsureSuccessStatusCode();
        Assert.Equal(
            "application/json; charset=utf-8",
            response.Content.Headers.ContentType!.ToString()
        );

        var json = await response.Content.ReadAsStringAsync();
        var workoutSession = JsonConvert.DeserializeObject<WorkoutSessionDto?>(json);

        Assert.Null(workoutSession);
    }

    /// <see cref="WorkoutSessionController.GetInProgress()" />
    [Fact]
    public async Task GetInProgress_ReturnsTheCurrentUsersActiveWorkout()
    {
        await RemoveInProgressWorkoutSessions();

        await AddWorkoutSession(
            new WorkoutSession
            {
                Uuid = Guid.Parse("5da5242e-b754-4855-8e70-6e8b6726dc0a"),
                Name = "Active workout",
                UserId = 1,
                CreatedAt = DateTime.Parse("2026-04-18T08:00:00Z"),
                UpdatedAt = DateTime.Parse("2026-04-18T08:30:00Z"),
                StartedAt = DateTime.Parse("2026-04-18T08:01:00Z"),
                SessionExercises =
                [
                    new SessionExercise
                    {
                        Uuid = Guid.Parse("dc0f777d-962a-4b78-8d45-db73808cbf7f"),
                        Name = "Bench",
                        Position = 0,
                        SessionSets =
                        [
                            new SessionSet
                            {
                                Uuid = Guid.Parse("446f03f5-b030-4197-b40c-1eb7485f8e60"),
                                Position = 0,
                                StartedAt = DateTime.Parse("2026-04-18T08:02:00Z"),
                            },
                        ],
                    },
                ],
            }
        );

        var response = await _client.GetAsync("/api/workout-sessions/in-progress");

        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        var workoutSession = JsonConvert.DeserializeObject<WorkoutSessionDto>(json);

        Assert.NotNull(workoutSession);
        Assert.Equal(Guid.Parse("5da5242e-b754-4855-8e70-6e8b6726dc0a"), workoutSession!.Uuid);
        Assert.Equal("Active workout", workoutSession.Name);
        Assert.True(workoutSession.StartedAt.HasValue);
        Assert.Null(workoutSession.EndedAt);
        Assert.Single(workoutSession.SessionExercises);
        Assert.Single(workoutSession.SessionExercises[0].SessionSets);
    }

    /// <see cref="WorkoutSessionController.GetInProgress()" />
    [Fact]
    public async Task GetInProgress_DoesNotReturnAnotherUsersActiveWorkout()
    {
        await RemoveInProgressWorkoutSessions();

        await AddWorkoutSession(
            new WorkoutSession
            {
                Uuid = Guid.Parse("f06d8888-0ccf-4513-87fa-5802eaf45b4b"),
                Name = "Other user active workout",
                UserId = 2,
                CreatedAt = DateTime.Parse("2026-04-18T08:00:00Z"),
                UpdatedAt = DateTime.Parse("2026-04-18T08:30:00Z"),
                StartedAt = DateTime.Parse("2026-04-18T08:01:00Z"),
                SessionExercises =
                [
                    new SessionExercise
                    {
                        Uuid = Guid.Parse("e5021ae0-9a54-4e37-b769-5e38b7bfab11"),
                        Name = "Rows",
                        Position = 0,
                        SessionSets =
                        [
                            new SessionSet
                            {
                                Uuid = Guid.Parse("d2d8286d-2252-42a0-80d7-69377db196d2"),
                                Position = 0,
                                StartedAt = DateTime.Parse("2026-04-18T08:02:00Z"),
                            },
                        ],
                    },
                ],
            }
        );

        var response = await _client.GetAsync("/api/workout-sessions/in-progress");

        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        var workoutSession = JsonConvert.DeserializeObject<WorkoutSessionDto?>(json);

        Assert.Null(workoutSession);
    }

    /// <see cref="WorkoutSessionController.GetInProgress()" />
    [Fact]
    public async Task GetInProgress_ReturnsTheNewestActiveWorkout_WhenMultipleExist()
    {
        await RemoveInProgressWorkoutSessions();

        await AddWorkoutSession(
            new WorkoutSession
            {
                Uuid = Guid.Parse("1da0fb36-b63d-4209-a10b-e6674ef1a7bd"),
                Name = "Older active workout",
                UserId = 1,
                CreatedAt = DateTime.Parse("2026-04-18T07:00:00Z"),
                UpdatedAt = DateTime.Parse("2026-04-18T07:30:00Z"),
                StartedAt = DateTime.Parse("2026-04-18T07:01:00Z"),
                SessionExercises =
                [
                    new SessionExercise
                    {
                        Uuid = Guid.Parse("45a9c778-5087-4cd5-b8fd-965d13f9878d"),
                        Name = "Squat",
                        Position = 0,
                        SessionSets =
                        [
                            new SessionSet
                            {
                                Uuid = Guid.Parse("d4b99ac9-df56-45d4-a85f-95fcb2a8c69d"),
                                Position = 0,
                                StartedAt = DateTime.Parse("2026-04-18T07:02:00Z"),
                            },
                        ],
                    },
                ],
            }
        );

        await AddWorkoutSession(
            new WorkoutSession
            {
                Uuid = Guid.Parse("6ca8d819-21f4-44c5-9ae2-8b245cb1a3e7"),
                Name = "Newest active workout",
                UserId = 1,
                CreatedAt = DateTime.Parse("2026-04-18T09:00:00Z"),
                UpdatedAt = DateTime.Parse("2026-04-18T09:30:00Z"),
                StartedAt = DateTime.Parse("2026-04-18T09:01:00Z"),
                SessionExercises =
                [
                    new SessionExercise
                    {
                        Uuid = Guid.Parse("f6e33599-8106-42e7-a260-ebd78caa0d29"),
                        Name = "Press",
                        Position = 0,
                        SessionSets =
                        [
                            new SessionSet
                            {
                                Uuid = Guid.Parse("48f5a120-33be-476b-a02f-c76354761414"),
                                Position = 0,
                                StartedAt = DateTime.Parse("2026-04-18T09:02:00Z"),
                            },
                        ],
                    },
                ],
            }
        );

        var response = await _client.GetAsync("/api/workout-sessions/in-progress");

        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        var workoutSession = JsonConvert.DeserializeObject<WorkoutSessionDto>(json);

        Assert.NotNull(workoutSession);
        Assert.Equal(Guid.Parse("6ca8d819-21f4-44c5-9ae2-8b245cb1a3e7"), workoutSession!.Uuid);
        Assert.Equal("Newest active workout", workoutSession.Name);
    }

    [Fact]
    public async Task PostStart_GeneratesFiveThreeOneWorkoutOnBackend()
    {
        var exerciseUuid = Guid.Parse("231f3f81-4680-4086-b228-168116ae330a");
        var originalExercise = await ConfigureFiveThreeOneExercise(
            exerciseUuid,
            100m,
            2,
            ProgressionScheme531BodyType.Upper
        );
        var movedSessions = await MoveTodayUnstartedSessionsOutOfMergeWindow();
        Guid? createdSessionUuid = null;

        try
        {
            var requestJson = JsonConvert.SerializeObject(
                new
                {
                    RoutineUuid = Guid.Parse("cd218127-b60d-46a7-bbc1-a17332bea15f"),
                }
            );
            var content = new StringContent(requestJson, Encoding.UTF8, "application/json");

            var response = await _client.PostAsync("/api/workout-sessions/start", content);

            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            var workoutSession = JsonConvert.DeserializeObject<WorkoutSessionDto>(json);

            createdSessionUuid = workoutSession!.Uuid;
            workoutSession.WorkoutProgramRoutineUuid.Should().Be(
                Guid.Parse("cd218127-b60d-46a7-bbc1-a17332bea15f")
            );
            var exercise = workoutSession.SessionExercises.Single();
            exercise.ProgressionScheme.Should().Be(ProgressionScheme.FiveThreeOne);
            exercise.SessionSets.Select(set => set.Weight).Should().Equal(70m, 80m, 90m);
            exercise.SessionSets.Select(set => set.Reps).Should().Equal(3m, 3m, 3m);
            exercise.SessionSets.First().StartedAt.Should().NotBeNull();
        }
        finally
        {
            await RestoreFiveThreeOneExercise(exerciseUuid, originalExercise);
            await RestoreMovedSessions(movedSessions);
            await DeleteWorkoutSession(createdSessionUuid);
        }
    }

    [Fact]
    public async Task Put_AdvancesFiveThreeOneOnlyWhenSessionTransitionsToCompleted()
    {
        var exerciseUuid = Guid.Parse("231f3f81-4680-4086-b228-168116ae330a");
        var originalExercise = await ConfigureFiveThreeOneExercise(
            exerciseUuid,
            100m,
            4,
            ProgressionScheme531BodyType.Upper
        );
        var movedSessions = await MoveTodayUnstartedSessionsOutOfMergeWindow();
        Guid? createdSessionUuid = null;

        try
        {
            var startRequestJson = JsonConvert.SerializeObject(
                new
                {
                    RoutineUuid = Guid.Parse("cd218127-b60d-46a7-bbc1-a17332bea15f"),
                }
            );
            var startContent = new StringContent(startRequestJson, Encoding.UTF8, "application/json");
            var startResponse = await _client.PostAsync("/api/workout-sessions/start", startContent);
            startResponse.EnsureSuccessStatusCode();
            var startedSession = JsonConvert.DeserializeObject<WorkoutSessionDto>(
                await startResponse.Content.ReadAsStringAsync()
            );

            createdSessionUuid = startedSession!.Uuid;
            startedSession.EndedAt = DateTime.Parse("2026-04-18T10:00:00Z");
            var updateJson = JsonConvert.SerializeObject(startedSession);
            var updateContent = new StringContent(updateJson, Encoding.UTF8, "application/json");

            var firstUpdateResponse = await _client.PutAsync("/api/workout-sessions", updateContent);
            firstUpdateResponse.EnsureSuccessStatusCode();

            await AssertRoutineExerciseProgression(exerciseUuid, 102.5m, 1);

            var secondUpdateResponse = await _client.PutAsync("/api/workout-sessions", updateContent);
            secondUpdateResponse.EnsureSuccessStatusCode();

            await AssertRoutineExerciseProgression(exerciseUuid, 102.5m, 1);
        }
        finally
        {
            await RestoreFiveThreeOneExercise(exerciseUuid, originalExercise);
            await RestoreMovedSessions(movedSessions);
            await DeleteWorkoutSession(createdSessionUuid);
        }
    }

    [Fact]
    public async Task PostStart_KeepsTheCurrentRotationMemberUntilWorkoutIsCompleted()
    {
        var movedSessions = await MoveTodayUnstartedSessionsOutOfMergeWindow();
        var workoutProgramUuid = Guid.NewGuid();
        var routineUuid = Guid.NewGuid();
        Guid? firstSessionUuid = null;
        Guid? secondSessionUuid = null;
        Guid rotationGroupUuid = Guid.Empty;

        try
        {
            rotationGroupUuid = await CreateRotationGroupWorkoutProgram(
                workoutProgramUuid,
                routineUuid
            );

            var firstSession = await StartWorkout(routineUuid);
            firstSessionUuid = firstSession.Uuid;
            firstSession.SessionExercises.Should().HaveCount(2);
            firstSession.SessionExercises.Select(exercise => exercise.Name).Should().Equal(
                "Bench 531",
                "Rows"
            );

            var secondSession = await StartWorkout(routineUuid);
            secondSessionUuid = secondSession.Uuid;
            secondSession.SessionExercises.Should().HaveCount(2);
            secondSession.SessionExercises.Select(exercise => exercise.Name).Should().Equal(
                "Bench 531",
                "Rows"
            );

            using var scope = fixture.Factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<LiftTrackerDbContext>();
            var rotationGroup = await db
                .RoutineExerciseRotationGroups.WhereUuid(rotationGroupUuid)
                .FirstAsync();
            rotationGroup.NextExerciseIndex.Should().Be(0);
        }
        finally
        {
            await DeleteWorkoutSession(firstSessionUuid);
            await DeleteWorkoutSession(secondSessionUuid);
            await _client.DeleteAsync($"/api/workout-programs/{workoutProgramUuid}");
            await RestoreMovedSessions(movedSessions);
        }
    }

    [Fact]
    public async Task PostStart_ReusesSameDayCheckInWithoutAdvancingRotation()
    {
        var movedSessions = await MoveTodayUnstartedSessionsOutOfMergeWindow();
        var workoutProgramUuid = Guid.NewGuid();
        var routineUuid = Guid.NewGuid();
        var checkInUuid = Guid.NewGuid();
        Guid rotationGroupUuid = Guid.Empty;

        try
        {
            rotationGroupUuid = await CreateRotationGroupWorkoutProgram(
                workoutProgramUuid,
                routineUuid
            );
            await AddWorkoutSession(
                new WorkoutSession
                {
                    Uuid = checkInUuid,
                    Name = "Check-in",
                    UserId = 1,
                    CreatedAt = DateTime.UtcNow,
                    StartedAt = null,
                    EndedAt = null,
                    SessionExercises = [],
                }
            );

            var startedSession = await StartWorkout(routineUuid);

            startedSession.Uuid.Should().Be(checkInUuid);
            startedSession.SessionExercises.Select(exercise => exercise.Name).Should().Equal(
                "Bench 531",
                "Rows"
            );

            using var scope = fixture.Factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<LiftTrackerDbContext>();
            var rotationGroup = await db
                .RoutineExerciseRotationGroups.WhereUuid(rotationGroupUuid)
                .FirstAsync();
            rotationGroup.NextExerciseIndex.Should().Be(0);
        }
        finally
        {
            await DeleteWorkoutSession(checkInUuid);
            await _client.DeleteAsync($"/api/workout-programs/{workoutProgramUuid}");
            await RestoreMovedSessions(movedSessions);
        }
    }

    [Fact]
    public async Task Put_AdvancesRotationGroupsOnlyWhenWorkoutTransitionsToCompleted()
    {
        var movedSessions = await MoveTodayUnstartedSessionsOutOfMergeWindow();
        var workoutProgramUuid = Guid.NewGuid();
        var routineUuid = Guid.NewGuid();
        Guid? createdSessionUuid = null;
        Guid rotationGroupUuid = Guid.Empty;

        try
        {
            rotationGroupUuid = await CreateRotationGroupWorkoutProgram(
                workoutProgramUuid,
                routineUuid
            );

            var startedSession = await StartWorkout(routineUuid);
            createdSessionUuid = startedSession.Uuid;

            using (var scope = fixture.Factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<LiftTrackerDbContext>();
                var rotationGroup = await db
                    .RoutineExerciseRotationGroups.WhereUuid(rotationGroupUuid)
                    .FirstAsync();
                rotationGroup.NextExerciseIndex.Should().Be(0);
            }

            startedSession.EndedAt = DateTime.Parse("2026-04-18T10:00:00Z");
            var updateResponse = await _client.PutAsync(
                "/api/workout-sessions",
                new StringContent(
                    JsonConvert.SerializeObject(startedSession),
                    Encoding.UTF8,
                    "application/json"
                )
            );
            updateResponse.EnsureSuccessStatusCode();

            using (var scope = fixture.Factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<LiftTrackerDbContext>();
                var rotationGroup = await db
                    .RoutineExerciseRotationGroups.WhereUuid(rotationGroupUuid)
                    .FirstAsync();
                rotationGroup.NextExerciseIndex.Should().Be(1);
            }

            var nextSession = await StartWorkout(routineUuid);
            nextSession.SessionExercises.Select(exercise => exercise.Name).Should().Equal(
                "DB Bench Volume",
                "Rows"
            );
            await DeleteWorkoutSession(nextSession.Uuid);
        }
        finally
        {
            await DeleteWorkoutSession(createdSessionUuid);
            await _client.DeleteAsync($"/api/workout-programs/{workoutProgramUuid}");
            await RestoreMovedSessions(movedSessions);
        }
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

    private async Task<(decimal? Weight, ProgressionScheme? Scheme, ProgressionScheme531Settings? Settings)> ConfigureFiveThreeOneExercise(
        Guid exerciseUuid,
        decimal trainingMax,
        int currentCycleWeek,
        ProgressionScheme531BodyType bodyType
    )
    {
        using var scope = fixture.Factory.Services.CreateScope();
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

    private async Task AssertRoutineExerciseProgression(
        Guid exerciseUuid,
        decimal expectedTrainingMax,
        int expectedCycleWeek
    )
    {
        using var scope = fixture.Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<LiftTrackerDbContext>();
        var exercise = await db.RoutineExercises.WhereUuid(exerciseUuid).FirstAsync();
        exercise.Weight.Should().Be(expectedTrainingMax);
        exercise.ProgressionSchemeSettings!.CurrentCycleWeek.Should().Be(expectedCycleWeek);
    }

    private async Task RestoreFiveThreeOneExercise(
        Guid exerciseUuid,
        (decimal? Weight, ProgressionScheme? Scheme, ProgressionScheme531Settings? Settings) originalExercise
    )
    {
        using var scope = fixture.Factory.Services.CreateScope();
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

    private async Task<List<(Guid Uuid, DateTime? CreatedAt)>> MoveTodayUnstartedSessionsOutOfMergeWindow()
    {
        using var scope = fixture.Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<LiftTrackerDbContext>();
        var now = DateTime.UtcNow;
        var sessions = await db
            .WorkoutSessions.Where(session => session.StartedAt == null)
            .Where(session => session.CreatedAt >= now.Date)
            .Where(session => session.CreatedAt < now.Date.AddDays(1))
            .ToListAsync();

        var originalValues = sessions
            .Select(session => (session.Uuid ?? Guid.Empty, session.CreatedAt))
            .ToList();

        foreach (var session in sessions)
        {
            session.CreatedAt = now.Date.AddDays(-1);
        }

        await db.SaveChangesAsync();
        return originalValues;
    }

    private async Task RestoreMovedSessions(List<(Guid Uuid, DateTime? CreatedAt)> sessions)
    {
        using var scope = fixture.Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<LiftTrackerDbContext>();
        foreach (var (uuid, createdAt) in sessions)
        {
            var session = await db.WorkoutSessions.WhereUuid(uuid).FirstAsync();
            session.CreatedAt = createdAt;
        }

        await db.SaveChangesAsync();
    }

    private async Task DeleteWorkoutSession(Guid? workoutSessionUuid)
    {
        if (workoutSessionUuid == null)
        {
            return;
        }

        using var scope = fixture.Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<LiftTrackerDbContext>();
        var session = await db
            .WorkoutSessions.Include(item => item.SessionExercises)
            .ThenInclude(item => item.SessionSets)
            .WhereUuid(workoutSessionUuid.Value)
            .FirstOrDefaultAsync();

        if (session == null)
        {
            return;
        }

        db.WorkoutSessions.Remove(session);
        await db.SaveChangesAsync();
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

    [Theory]
    [InlineData(null)]
    [InlineData(1)]
    [InlineData(10)]
    public async Task Post_AcceptsPlannedRpeValues(int? plannedRpe)
    {
        var sessionUuid = Guid.NewGuid();
        var exerciseUuid = Guid.NewGuid();
        var setUuid = Guid.NewGuid();
        var newWorkoutSession = new
        {
            Uuid = sessionUuid,
            Name = "Planned RPE workout",
            WorkoutProgramRoutineUuid = (Guid?)null,
            SessionExercises = new[]
            {
                new
                {
                    Uuid = exerciseUuid,
                    Name = "Deadlifts",
                    PlannedRpe = plannedRpe,
                    Position = 0,
                    RoutineExerciseUuid = (Guid?)null,
                    SessionSets = new[]
                    {
                        new
                        {
                            Uuid = setUuid,
                            Reps = 5m,
                            Weight = 180m,
                            Position = 0,
                        },
                    },
                },
            },
        };

        var response = await _client.PostAsync(
            "/api/workout-sessions",
            new StringContent(
                JsonConvert.SerializeObject(newWorkoutSession),
                Encoding.UTF8,
                "application/json"
            )
        );

        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        var createdSession = JsonConvert.DeserializeObject<WorkoutSessionDto>(json);
        Assert.Equal(plannedRpe, Assert.Single(createdSession!.SessionExercises).PlannedRpe);

        await _client.DeleteAsync($"/api/workout-sessions/{sessionUuid}");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(11)]
    public async Task Post_ReturnsBadRequest_WhenPlannedRpeIsOutOfRange(int plannedRpe)
    {
        var sessionUuid = Guid.NewGuid();
        var exerciseUuid = Guid.NewGuid();
        var setUuid = Guid.NewGuid();
        var newWorkoutSession = new
        {
            Uuid = sessionUuid,
            Name = "Invalid planned RPE workout",
            WorkoutProgramRoutineUuid = (Guid?)null,
            SessionExercises = new[]
            {
                new
                {
                    Uuid = exerciseUuid,
                    Name = "Deadlifts",
                    PlannedRpe = plannedRpe,
                    Position = 0,
                    RoutineExerciseUuid = (Guid?)null,
                    SessionSets = new[]
                    {
                        new
                        {
                            Uuid = setUuid,
                            Reps = 5m,
                            Weight = 180m,
                            Position = 0,
                        },
                    },
                },
            },
        };

        var response = await _client.PostAsync(
            "/api/workout-sessions",
            new StringContent(
                JsonConvert.SerializeObject(newWorkoutSession),
                Encoding.UTF8,
                "application/json"
            )
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var responseJson = await response.Content.ReadAsStringAsync();
        responseJson.Should().Contain("Planned RPE must be between 1 and 10");
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

    private async Task<Guid> CreateRotationGroupWorkoutProgram(Guid workoutProgramUuid, Guid routineUuid)
    {
        var rotationGroupUuid = Guid.NewGuid();
        var firstExerciseUuid = Guid.NewGuid();
        var secondExerciseUuid = Guid.NewGuid();
        var thirdExerciseUuid = Guid.NewGuid();
        var workoutProgram = new WorkoutProgram
        {
            Uuid = workoutProgramUuid,
            Name = "Rotation Start Test",
            UserId = 1,
            WorkoutProgramRoutines =
            [
                new WorkoutProgramRoutine
                {
                    Uuid = routineUuid,
                    Name = "Workout A",
                    NormalDay = "any",
                    Position = 0,
                    RoutineExerciseRotationGroups =
                    [
                        new RoutineExerciseRotationGroup
                        {
                            Uuid = rotationGroupUuid,
                            NextExerciseIndex = 0,
                        },
                    ],
                    RoutineExercises =
                    [
                        new RoutineExercise
                        {
                            Uuid = firstExerciseUuid,
                            Name = "Bench 531",
                            NumberOfSets = 3,
                            Position = 0,
                            Weight = 100,
                            RotationGroupUuid = rotationGroupUuid,
                            RotationGroupPosition = 0,
                        },
                        new RoutineExercise
                        {
                            Uuid = secondExerciseUuid,
                            Name = "DB Bench Volume",
                            NumberOfSets = 4,
                            Position = 1,
                            Weight = 35,
                            RotationGroupUuid = rotationGroupUuid,
                            RotationGroupPosition = 1,
                        },
                        new RoutineExercise
                        {
                            Uuid = thirdExerciseUuid,
                            Name = "Rows",
                            NumberOfSets = 3,
                            Position = 2,
                            Weight = 60,
                        },
                    ],
                },
            ],
        };

        var response = await _client.PostAsync(
            "/api/workout-programs",
            new StringContent(
                JsonConvert.SerializeObject(workoutProgram),
                Encoding.UTF8,
                "application/json"
            )
        );
        response.EnsureSuccessStatusCode();
        return rotationGroupUuid;
    }

    private async Task<WorkoutSessionDto> StartWorkout(Guid routineUuid)
    {
        var response = await _client.PostAsync(
            "/api/workout-sessions/start",
            new StringContent(
                JsonConvert.SerializeObject(new { RoutineUuid = routineUuid }),
                Encoding.UTF8,
                "application/json"
            )
        );
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        return JsonConvert.DeserializeObject<WorkoutSessionDto>(json)!;
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

    private async Task AddWorkoutSession(WorkoutSession workoutSession)
    {
        using var scope = fixture.Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<LiftTrackerDbContext>();
        db.WorkoutSessions.Add(workoutSession);
        await db.SaveChangesAsync();
    }

    private async Task RemoveInProgressWorkoutSessions()
    {
        using var scope = fixture.Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<LiftTrackerDbContext>();
        var inProgressSessions = await db
            .WorkoutSessions.Where(session => session.StartedAt != null)
            .Where(session => session.EndedAt == null)
            .ToListAsync();
        db.WorkoutSessions.RemoveRange(inProgressSessions);
        await db.SaveChangesAsync();
    }
}
