using System.Text;
using LiftTrackerApi.Controllers;
using LiftTrackerApi.Dtos;
using LiftTrackerApi.Entities;
using LiftTrackerApi.Tests.Integration.Fixtures;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

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
        var newWorkoutSession = new
        {
            Uuid = Guid.Parse("36465433-7e55-4282-9c61-761417fbcda8"),
            Name = "Deadlift day",
            WorkoutProgramRoutineUuid = Guid.Parse("073379e9-0bc1-4f69-9cd5-1b0e7074d1a3"),
            SessionExercises = new[]
            {
                new
                {
                    Uuid = Guid.Parse("0925e348-49f1-4a5f-8f27-47f4cf6ca6c3"),
                    Name = "Deadlifts",
                    Position = 0,
                    RoutineExerciseUuid = Guid.Parse("21ba1db3-8045-473c-901d-18b19ba33fe5"),
                    SessionSets = new[]
                    {
                        new
                        {
                            Uuid = Guid.Parse("1ad2a000-c179-4019-83ef-97274be42c5e"),
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
        var exercise = createdSession!.SessionExercises.First();
        exercise.WarmUpDuration = 10;
        exercise.Notes = "This is a test note";

        var set = exercise.SessionSets.First();
        set.RestPeriodDuration = 15;
        set.Weight = 20;

        var originalPostResponse = JsonConvert.SerializeObject(exercise);
        var putContent = new StringContent(originalPostResponse, Encoding.UTF8, "application/json");
        var responseFromEdit = await _client.PutAsync("api/session-exercises", putContent);

        // Assert
        await AssertSimpleSaveResponse(responseFromEdit);

        var responseFromDelete = await _client.DeleteAsync(
            "/api/workout-sessions/36465433-7e55-4282-9c61-761417fbcda8"
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

    /// <see cref="SessionExerciseController.GetHistory(Guid, int, int)" />
    [Fact]
    public async Task GetHistory_ReturnsSiblingsAndSelfOlderThanSourceExercise()
    {
        // Act
        var response = await _client.GetAsync(
            "/api/session-exercises/history/a85ca59d-e66c-4b19-aed1-222222222221"
        );

        // Assert
        var json = await response.Content.ReadAsStringAsync();
        response.EnsureSuccessStatusCode();
        Assert.Equal(
            "application/json; charset=utf-8",
            response.Content.Headers.ContentType!.ToString()
        );

        var history = DeserializeHistoryResponse(json);

        Assert.Equal(6, history!.Items.Count);
        Assert.Equal(1, history.PageIndex);
        Assert.Equal(10, history.PageSize);
        Assert.Equal(6, history.TotalCount);
        for (int i = 0; i < history.Items.Count; i++)
        {
            var sessionExercise = history.Items[i];
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

    /// <see cref="SessionExerciseController.GetHistory(Guid, int, int)" />
    [Fact]
    public async Task GetHistory_DoesNotReturnExercisesFromDifferentRoutineExercise()
    {
        using var scope = fixture.Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<LiftTrackerDbContext>();
        var populateRoutine = db.WorkoutProgramRoutines.First(r =>
            r.Uuid == Guid.Parse("cd218127-b60d-46a7-bbc1-a17332bea15f")
        );

        var pullUps = new RoutineExercise
        {
            Uuid = Guid.Parse("80000000-0000-0000-0000-000000000001"),
            Name = "Pull Ups",
            Position = 10,
            WorkoutProgramRoutine = populateRoutine,
            CreatedAt = DateTime.UtcNow.AddDays(-10),
        };
        var shoulderPress = new RoutineExercise
        {
            Uuid = Guid.Parse("80000000-0000-0000-0000-000000000002"),
            Name = "Shoulder Press",
            Position = 11,
            WorkoutProgramRoutine = populateRoutine,
            CreatedAt = DateTime.UtcNow.AddDays(-10),
        };

        db.AddRange(pullUps, shoulderPress);
        db.AddRange(
            new WorkoutSession
            {
                Uuid = Guid.Parse("81000000-0000-0000-0000-000000000001"),
                Name = "History 1",
                UserId = 1,
                CreatedAt = DateTime.UtcNow.AddDays(-4),
                WorkoutProgramRoutine = populateRoutine,
                SessionExercises =
                [
                    new SessionExercise
                    {
                        Uuid = Guid.Parse("82000000-0000-0000-0000-000000000001"),
                        Name = "Pull Ups 1",
                        Position = 0,
                        CreatedAt = DateTime.UtcNow.AddDays(-4),
                        RoutineExercise = pullUps,
                        SessionSets =
                        [
                            new SessionSet
                            {
                                Uuid = Guid.Parse("83000000-0000-0000-0000-000000000001"),
                                Position = 0,
                                Reps = 5,
                                Weight = 0,
                            },
                        ],
                    },
                ],
            },
            new WorkoutSession
            {
                Uuid = Guid.Parse("81000000-0000-0000-0000-000000000002"),
                Name = "History 2",
                UserId = 1,
                CreatedAt = DateTime.UtcNow.AddDays(-3),
                WorkoutProgramRoutine = populateRoutine,
                SessionExercises =
                [
                    new SessionExercise
                    {
                        Uuid = Guid.Parse("82000000-0000-0000-0000-000000000002"),
                        Name = "Shoulder Press 1",
                        Position = 0,
                        CreatedAt = DateTime.UtcNow.AddDays(-3),
                        RoutineExercise = shoulderPress,
                        SessionSets =
                        [
                            new SessionSet
                            {
                                Uuid = Guid.Parse("83000000-0000-0000-0000-000000000002"),
                                Position = 0,
                                Reps = 8,
                                Weight = 30,
                            },
                        ],
                    },
                ],
            },
            new WorkoutSession
            {
                Uuid = Guid.Parse("81000000-0000-0000-0000-000000000003"),
                Name = "History 3",
                UserId = 1,
                CreatedAt = DateTime.UtcNow.AddDays(-2),
                WorkoutProgramRoutine = populateRoutine,
                SessionExercises =
                [
                    new SessionExercise
                    {
                        Uuid = Guid.Parse("82000000-0000-0000-0000-000000000003"),
                        Name = "Pull Ups 2",
                        Position = 0,
                        CreatedAt = DateTime.UtcNow.AddDays(-2),
                        RoutineExercise = pullUps,
                        SessionSets =
                        [
                            new SessionSet
                            {
                                Uuid = Guid.Parse("83000000-0000-0000-0000-000000000003"),
                                Position = 0,
                                Reps = 6,
                                Weight = 5,
                            },
                        ],
                    },
                ],
            },
            new WorkoutSession
            {
                Uuid = Guid.Parse("81000000-0000-0000-0000-000000000004"),
                Name = "History 4",
                UserId = 1,
                CreatedAt = DateTime.UtcNow.AddDays(-1),
                WorkoutProgramRoutine = populateRoutine,
                SessionExercises =
                [
                    new SessionExercise
                    {
                        Uuid = Guid.Parse("82000000-0000-0000-0000-000000000004"),
                        Name = "Shoulder Press 2",
                        Position = 0,
                        CreatedAt = DateTime.UtcNow.AddDays(-1),
                        RoutineExercise = shoulderPress,
                        SessionSets =
                        [
                            new SessionSet
                            {
                                Uuid = Guid.Parse("83000000-0000-0000-0000-000000000004"),
                                Position = 0,
                                Reps = 10,
                                Weight = 35,
                            },
                        ],
                    },
                ],
            },
            new WorkoutSession
            {
                Uuid = Guid.Parse("81000000-0000-0000-0000-000000000005"),
                Name = "Source Session",
                UserId = 1,
                CreatedAt = DateTime.UtcNow,
                WorkoutProgramRoutine = populateRoutine,
                SessionExercises =
                [
                    new SessionExercise
                    {
                        Uuid = Guid.Parse("82000000-0000-0000-0000-000000000005"),
                        Name = "Pull Ups Source",
                        Position = 0,
                        CreatedAt = DateTime.UtcNow,
                        RoutineExercise = pullUps,
                        SessionSets =
                        [
                            new SessionSet
                            {
                                Uuid = Guid.Parse("83000000-0000-0000-0000-000000000005"),
                                Position = 0,
                                Reps = 7,
                                Weight = 10,
                            },
                        ],
                    },
                ],
            }
        );
        db.SaveChanges();

        var response = await _client.GetAsync(
            "/api/session-exercises/history/82000000-0000-0000-0000-000000000005"
        );

        var json = await response.Content.ReadAsStringAsync();
        response.EnsureSuccessStatusCode();

        var history = DeserializeHistoryResponse(json);

        Assert.Equal(3, history!.Items.Count);
        Assert.Equal(
            [
                Guid.Parse("82000000-0000-0000-0000-000000000001"),
                Guid.Parse("82000000-0000-0000-0000-000000000003"),
                Guid.Parse("82000000-0000-0000-0000-000000000005"),
            ],
            history.Items.Select(exercise => exercise.Uuid).ToList()
        );
        Assert.All(history.Items, exercise => Assert.StartsWith("Pull Ups", exercise.Name));
    }

    /// <see cref="SessionExerciseController.GetHistory(Guid, int, int)" />
    [Fact]
    public async Task GetHistory_PaginatesNewestHistoryWhileReturningEachPageAscending()
    {
        using var scope = fixture.Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<LiftTrackerDbContext>();
        var populateRoutine = db.WorkoutProgramRoutines.First(r =>
            r.Uuid == Guid.Parse("cd218127-b60d-46a7-bbc1-a17332bea15f")
        );

        var routineExercise = new RoutineExercise
        {
            Uuid = Guid.Parse("84000000-0000-0000-0000-000000000001"),
            Name = "History Pagination Exercise",
            Position = 20,
            WorkoutProgramRoutine = populateRoutine,
            CreatedAt = DateTime.UtcNow.AddDays(-40),
        };

        db.Add(routineExercise);

        var baseDate = DateTime.UtcNow.AddDays(-30);
        for (var i = 1; i <= 12; i++)
        {
            var createdAt = baseDate.AddDays(i);
            db.Add(
                new WorkoutSession
                {
                    Uuid = Guid.Parse($"84000000-0000-0000-0000-0000000000{i:00}"),
                    Name = $"Paginated history {i}",
                    UserId = 1,
                    CreatedAt = createdAt,
                    WorkoutProgramRoutine = populateRoutine,
                    SessionExercises =
                    [
                        new SessionExercise
                        {
                            Uuid = Guid.Parse($"85000000-0000-0000-0000-0000000000{i:00}"),
                            Name = $"History Exercise {i}",
                            Position = 0,
                            CreatedAt = createdAt,
                            RoutineExercise = routineExercise,
                            SessionSets =
                            [
                                new SessionSet
                                {
                                    Uuid = Guid.Parse($"86000000-0000-0000-0000-0000000000{i:00}"),
                                    Position = 0,
                                    Reps = i,
                                    Weight = i * 5,
                                },
                            ],
                        },
                    ],
                }
            );
        }

        db.SaveChanges();

        var pageOneResponse = await _client.GetAsync(
            "/api/session-exercises/history/85000000-0000-0000-0000-000000000012?pageIndex=1&pageSize=5"
        );
        var pageOneJson = await pageOneResponse.Content.ReadAsStringAsync();
        pageOneResponse.EnsureSuccessStatusCode();
        var pageOne = DeserializeHistoryResponse(pageOneJson);

        Assert.Equal(12, pageOne!.TotalCount);
        Assert.Equal(1, pageOne.PageIndex);
        Assert.Equal(5, pageOne.PageSize);
        Assert.Equal(3, pageOne.TotalPages);
        Assert.True(pageOne.HasNextPage);
        Assert.False(pageOne.HasPreviousPage);
        Assert.Equal(
            [
                Guid.Parse("85000000-0000-0000-0000-000000000008"),
                Guid.Parse("85000000-0000-0000-0000-000000000009"),
                Guid.Parse("85000000-0000-0000-0000-000000000010"),
                Guid.Parse("85000000-0000-0000-0000-000000000011"),
                Guid.Parse("85000000-0000-0000-0000-000000000012"),
            ],
            pageOne.Items.Select(exercise => exercise.Uuid).ToList()
        );
        Assert.True(
            pageOne.Items
                .Zip(
                    pageOne.Items.Skip(1),
                    (current, next) => current.CreatedAt <= next.CreatedAt
                )
                .All(x => x)
        );

        var pageTwoResponse = await _client.GetAsync(
            "/api/session-exercises/history/85000000-0000-0000-0000-000000000012?pageIndex=2&pageSize=5"
        );
        var pageTwoJson = await pageTwoResponse.Content.ReadAsStringAsync();
        pageTwoResponse.EnsureSuccessStatusCode();
        var pageTwo = DeserializeHistoryResponse(pageTwoJson);

        Assert.Equal(12, pageTwo!.TotalCount);
        Assert.Equal(2, pageTwo.PageIndex);
        Assert.Equal(5, pageTwo.PageSize);
        Assert.True(pageTwo.HasNextPage);
        Assert.True(pageTwo.HasPreviousPage);
        Assert.Equal(
            [
                Guid.Parse("85000000-0000-0000-0000-000000000003"),
                Guid.Parse("85000000-0000-0000-0000-000000000004"),
                Guid.Parse("85000000-0000-0000-0000-000000000005"),
                Guid.Parse("85000000-0000-0000-0000-000000000006"),
                Guid.Parse("85000000-0000-0000-0000-000000000007"),
            ],
            pageTwo.Items.Select(exercise => exercise.Uuid).ToList()
        );
        Assert.True(
            pageTwo.Items
                .Zip(
                    pageTwo.Items.Skip(1),
                    (current, next) => current.CreatedAt <= next.CreatedAt
                )
                .All(x => x)
        );
    }

    private static SessionExerciseHistoryResponse DeserializeHistoryResponse(string json)
    {
        var parsed = JObject.Parse(json);
        return parsed.ToObject<SessionExerciseHistoryResponse>()!;
    }

    private class SessionExerciseHistoryResponse
    {
        public int TotalCount { get; init; }
        public int PageIndex { get; init; }
        public int PageSize { get; init; }
        public int TotalPages { get; init; }
        public bool HasPreviousPage { get; init; }
        public bool HasNextPage { get; init; }
        public List<SessionExerciseStatsDto> Items { get; init; } = [];
    }
}
