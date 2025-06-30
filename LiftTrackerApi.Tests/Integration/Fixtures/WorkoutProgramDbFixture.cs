using System.Net.Http.Headers;

namespace LiftTrackerApi.Tests.Integration.Fixtures;

using Entities;
using Microsoft.EntityFrameworkCore;

[CollectionDefinition("WorkoutProgramTestCollection")]
public class WorkoutProgramDbFixture : ICollectionFixture<WorkoutProgramDbFixture>
{
    public HttpClient Client { get; private set; }

    public WorkoutProgramDbFixture()
    {
        // Arrange
        var factory = new LiftTrackerWebApplicationFactory();
        Client = factory.CreateClient();
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Test");

        var db = factory.Services.GetService<LiftTrackerDbContext>();
        db!.Database.ExecuteSqlRaw(
            """
                  SET FOREIGN_KEY_CHECKS = 0;
                  truncate table WorkoutPrograms;
                  truncate table WorkoutProgramRoutines;
                  truncate table RoutineExercises;
                  SET FOREIGN_KEY_CHECKS = 1;
            """
        );

        var yesterday = DateTime.UtcNow.AddDays(-1);
        var now = DateTime.UtcNow;

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
                new()
                {
                    Uuid = Guid.Parse("cd218127-b60d-46a7-bbc1-a17332bea15f"),
                    Name = "Populated Routine",
                    NormalDay = "any",
                    Position = 1,
                    UpdatedAt = yesterday,
                    CreatedAt = yesterday,
                    RoutineExercises = new List<RoutineExercise>
                    {
                        new()
                        {
                            Uuid = Guid.Parse("231f3f81-4680-4086-b228-168116ae330a"),
                            Name = "Push Ups",
                            NumberOfSets = 3,
                            Position = 0,
                            Weight = 50,
                            RestPeriod = 120,
                            WarmUp = 60,
                        },
                        new()
                        {
                            Uuid = Guid.Parse("21ba1db3-8045-473c-901d-18b19ba33fe5"),
                            Name = "Deleted Exercise",
                            NumberOfSets = 3,
                            Position = 0,
                            Weight = 50,
                            RestPeriod = 120,
                            WarmUp = 60,
                            DeletedAt = yesterday,
                        },
                    },
                },
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
        db.SaveChanges();
    }

    public void Dispose()
    {
        // clean up any unmanaged references
    }
}
