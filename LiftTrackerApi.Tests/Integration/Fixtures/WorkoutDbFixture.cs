using System.Net.Http.Headers;

namespace LiftTrackerApi.Tests.Integration.Fixtures;

using Entities;
using Microsoft.EntityFrameworkCore;

[CollectionDefinition("WorkoutProgramTestCollection")]
public class WorkoutDbFixture : ICollectionFixture<WorkoutDbFixture>
{
    public HttpClient Client { get; private set; }
    public LiftTrackerWebApplicationFactory Factory { get; }

    public WorkoutDbFixture()
    {
        // Arrange
        Factory = new LiftTrackerWebApplicationFactory();
        Client = Factory.CreateClient();
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Test");

        var db = Factory.Services.GetService<LiftTrackerDbContext>();
        db!.Database.ExecuteSqlRaw(
            """
                  SET FOREIGN_KEY_CHECKS = 0;
                  truncate table WorkoutPrograms;
                  truncate table WorkoutProgramRoutines;
                  truncate table RoutineExercises;

                  truncate table WorkoutSessions;
                  truncate table SessionExercises;
                  truncate table SessionSets;
                  SET FOREIGN_KEY_CHECKS = 1;
            """
        );

        var yesterday = DateTime.UtcNow.AddDays(-1);
        var now = DateTime.UtcNow;

        var pushUps = new RoutineExercise
        {
            Uuid = Guid.Parse("231f3f81-4680-4086-b228-168116ae330a"),
            Name = "Push Ups",
            NumberOfSets = 3,
            Position = 0,
            Weight = 50,
            RestPeriod = 120,
            WarmUp = 60,
            CreatedAt = yesterday,
            UpdatedAt = yesterday,
        };

        var deletedExercise = new RoutineExercise()
        {
            Uuid = Guid.Parse("21ba1db3-8045-473c-901d-18b19ba33fe5"),
            Name = "Deleted Exercise",
            NumberOfSets = 3,
            Position = 0,
            Weight = 50,
            RestPeriod = 120,
            WarmUp = 60,
            DeletedAt = yesterday,
        };

        var populateRoutine = new WorkoutProgramRoutine()
        {
            Uuid = Guid.Parse("cd218127-b60d-46a7-bbc1-a17332bea15f"),
            Name = "Populated Routine",
            NormalDay = "any",
            Position = 1,
            UpdatedAt = yesterday,
            CreatedAt = yesterday,
            RoutineExercises = new List<RoutineExercise> { pushUps, deletedExercise },
        };

        var workoutProgram = new WorkoutProgram
        {
            Uuid = Guid.Parse("186383a6-e369-4071-b80d-70c82d2495d1"),
            Name = "Test Workout Program",
            UserId = 1,
            WorkoutProgramRoutines = new List<WorkoutProgramRoutine>
            {
                new()
                {
                    Uuid = Guid.Parse("073379e9-0bc1-4f69-9cd5-1b0e7074d1a3"),
                    Name = "Empty First Routine",
                    NormalDay = "any",
                    Position = 0,
                    UpdatedAt = yesterday,
                    CreatedAt = yesterday,
                    RoutineExercises = new List<RoutineExercise>(),
                },
                populateRoutine,
                new()
                {
                    Uuid = Guid.Parse("8a94625e-88be-4750-ade2-262cf14aa921"),
                    Name = "Empty First Routine (last touched)",
                    NormalDay = "any",
                    Position = 2,
                    UpdatedAt = now,
                    CreatedAt = now,
                    RoutineExercises = new List<RoutineExercise>(),
                },
                new()
                {
                    Uuid = Guid.Parse("6dd31c4f-15aa-4036-b959-4ded8990fb9d"),
                    Name = "Deleted Routine",
                    NormalDay = "any",
                    Position = 2,
                    DeletedAt = yesterday,
                    RoutineExercises = new List<RoutineExercise>(),
                },
            },
        };

        db.Add(workoutProgram);

        var workoutSession = new WorkoutSession
        {
            Uuid = Guid.Parse("27ffe07e-ecfd-4599-b132-6ec9e35fee1d"),
            Name = "Test Workout Session",
            UserId = 1,
            CreatedAt = now,
            UpdatedAt = now,
            WorkoutProgramRoutine = populateRoutine,
            SessionExercises = new List<SessionExercise>
            {
                new()
                {
                    Uuid = Guid.Parse("a85ca59d-e66c-4b19-aed1-8e041e89011f"),
                    Name = "Push Ups",
                    Position = 0,
                    RoutineExercise = pushUps,
                    SessionSets = new List<SessionSet>
                    {
                        new()
                        {
                            Uuid = Guid.Parse("b0d6a7d7-9185-4019-bdfa-5b0411d946ab"),
                            Reps = 10,
                            Weight = 100,
                            Position = 0,
                            RestPeriodDuration = 60,
                            RestPeriodStartedAt = DateTime.Parse("2023-10-01T12:02:00Z"),
                            RestPeriodEndedAt = DateTime.Parse("2023-10-01T12:03:00Z"),
                            WarmUpDuration = 0,
                            WarmUpStartedAt = DateTime.Parse("2023-10-01T12:00:00Z"),
                            WarmUpEndedAt = DateTime.Parse("2023-10-01T12:01:00Z"),
                        },
                        new()
                        {
                            Uuid = Guid.Parse("521fff85-27f7-464c-bce8-3cc269e565bd"),
                            Reps = 10,
                            Weight = 100,
                            Position = 1,
                            RestPeriodDuration = 60,
                            RestPeriodStartedAt = null,
                            RestPeriodEndedAt = null,
                            WarmUpDuration = 0,
                            WarmUpStartedAt = null,
                            WarmUpEndedAt = null,
                        },
                    },
                },
                new()
                {
                    Uuid = Guid.Parse("46bcb5d3-db0b-4e0d-9445-fd76aa3143a4"),
                    Name = "Squats",
                    Position = 1,
                    RoutineExercise = deletedExercise,
                    SessionSets = new List<SessionSet>
                    {
                        new()
                        {
                            Uuid = Guid.Parse("35ace3f8-8e76-4c7b-a73e-d0a0c15d2442"),
                            Reps = 20,
                            Weight = 60,
                            Position = 0,
                            RestPeriodDuration = 600,
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
        db.Add(workoutSession);

        for (var i = 1; i <= 6; i++)
        {
            var sessionForHistory = new WorkoutSession
            {
                Uuid = Guid.Parse($"27ffe07e-ecfd-4599-b132-11111111111{i}"),
                Name = "Test Workout Session",
                UserId = 1,
                CreatedAt = now,
                UpdatedAt = now,
                WorkoutProgramRoutine = populateRoutine,
                SessionExercises = new List<SessionExercise>
                {
                    new()
                    {
                        Uuid = Guid.Parse($"a85ca59d-e66c-4b19-aed1-22222222222{i}"),
                        Name = $"Push Ups {i}",
                        Position = 0,
                        RoutineExercise = pushUps,
                        // CreatedAt must be in the past to be preserved by LiftTrackerDbContext.UpdateTimestamps()
                        CreatedAt = DateTime.UtcNow.AddDays(-i),
                        SessionSets = new List<SessionSet>
                        {
                            new()
                            {
                                Uuid = Guid.Parse($"b0d6a7d7-9185-4019-bdfa-33333333333{i}"),
                                Reps = i,
                                Weight = i * 10,
                                Position = 0,
                            },
                        },
                    },
                },
            };
            db.Add(sessionForHistory);
        }

        db.SaveChanges();
    }
}
