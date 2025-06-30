using System.Net;
using System.Text;
using LiftTrackerApi.Controllers;
using LiftTrackerApi.Entities;
using LiftTrackerApi.Extensions;
using LiftTrackerApi.Tests.Integration.Fixtures;
using Newtonsoft.Json;

namespace LiftTrackerApi.Tests.Integration;

[Collection("WorkoutProgramTestCollection")]
public class WorkoutProgramControllerTests(WorkoutProgramDbFixture fixture)
    : IClassFixture<WorkoutProgramDbFixture>
{
    private readonly HttpClient _client = fixture.Client;

    /// <see cref="WorkoutProgramController.Index(Guid?)" />
    [Fact]
    public async Task Get_EndpointsReturnsEntities()
    {
        // Act
        var response = await _client.GetAsync("/workout-programs");

        // Assert
        response.EnsureSuccessStatusCode();
        Assert.Equal(
            "application/json; charset=utf-8",
            response.Content.Headers.ContentType!.ToString()
        );

        var json = await response.Content.ReadAsStringAsync();
        var workoutPrograms = JsonConvert.DeserializeObject<List<WorkoutProgram>>(json);

        var workoutProgram = workoutPrograms!
            .WhereUuid("186383a6-e369-4071-b80d-70c82d2495d1")
            .First();

        Assert.Equal(Guid.Parse("186383a6-e369-4071-b80d-70c82d2495d1"), workoutProgram.Uuid);
        Assert.Equal("Test Workout Program", workoutProgram.Name);
        Assert.Equal(1, workoutProgram.UserId);

        var routines = workoutProgram.WorkoutProgramRoutines;
        Assert.Equal(3, routines.Count);

        var emptyFirstRoutine = routines.First();
        Assert.Equal(Guid.Parse("073379e9-0bc1-4f69-9cd5-1b0e7074d1a3"), emptyFirstRoutine.Uuid);
        Assert.Equal("Empty First Routine", emptyFirstRoutine.Name);
        Assert.Equal("any", emptyFirstRoutine.NormalDay);
        Assert.Equal(0, emptyFirstRoutine.Position);
        Assert.Empty(emptyFirstRoutine.RoutineExercises);

        var populatedRoutine = routines.ElementAt(1);
        Assert.Equal(Guid.Parse("cd218127-b60d-46a7-bbc1-a17332bea15f"), populatedRoutine.Uuid);
        Assert.Equal("Populated Routine", populatedRoutine.Name);
        Assert.Equal("any", populatedRoutine.NormalDay);
        Assert.Equal(1, populatedRoutine.Position);

        var routineExercises = populatedRoutine.RoutineExercises;
        Assert.Single(routineExercises);

        var routineExercise = routineExercises.First();
        Assert.Equal(Guid.Parse("231f3f81-4680-4086-b228-168116ae330a"), routineExercise.Uuid);
        Assert.Equal("Push Ups", routineExercise.Name);
        Assert.Equal(3, routineExercise.NumberOfSets);
        Assert.Equal(50, routineExercise.Weight);
        Assert.Equal(120, routineExercise.RestPeriod);
        Assert.Equal(60, routineExercise.WarmUp);
        Assert.Equal(0, routineExercise.Position);

        var emptyLastRoutine = routines.Last();
        Assert.Equal(Guid.Parse("8a94625e-88be-4750-ade2-262cf14aa921"), emptyLastRoutine.Uuid);
        Assert.Equal("Empty First Routine (last touched)", emptyLastRoutine.Name);
        Assert.Equal("any", emptyLastRoutine.NormalDay);
        Assert.Equal(2, emptyLastRoutine.Position);
        Assert.Empty(emptyLastRoutine.RoutineExercises);
    }

    /// <see cref="WorkoutProgramController.Index(Guid?)" />
    [Fact]
    public async Task Get_ByRoutineUuid_EndpointsReturnsEntity()
    {
        // Act
        var response = await _client.GetAsync(
            "/workout-programs?routineUuid=cd218127-b60d-46a7-bbc1-a17332bea15f"
        );

        // Assert
        response.EnsureSuccessStatusCode();
        Assert.Equal(
            "application/json; charset=utf-8",
            response.Content.Headers.ContentType!.ToString()
        );
        var json = await response.Content.ReadAsStringAsync();

        var workoutProgram = JsonConvert.DeserializeObject<WorkoutProgram>(json);
        Assert.Equal(Guid.Parse("186383a6-e369-4071-b80d-70c82d2495d1"), workoutProgram!.Uuid);
        Assert.Equal("Test Workout Program", workoutProgram.Name);
        Assert.Equal(1, workoutProgram.UserId);

        var routines = workoutProgram.WorkoutProgramRoutines;
        Assert.Equal(3, routines.Count);

        var emptyFirstRoutine = routines.First();
        Assert.Equal(Guid.Parse("073379e9-0bc1-4f69-9cd5-1b0e7074d1a3"), emptyFirstRoutine.Uuid);
        Assert.Equal("Empty First Routine", emptyFirstRoutine.Name);
        Assert.Equal("any", emptyFirstRoutine.NormalDay);
        Assert.Equal(0, emptyFirstRoutine.Position);
        Assert.Empty(emptyFirstRoutine.RoutineExercises);

        var populatedRoutine = routines.ElementAt(1);
        Assert.Equal(Guid.Parse("cd218127-b60d-46a7-bbc1-a17332bea15f"), populatedRoutine.Uuid);
        Assert.Equal("Populated Routine", populatedRoutine.Name);
        Assert.Equal("any", populatedRoutine.NormalDay);
        Assert.Equal(1, populatedRoutine.Position);

        var routineExercises = populatedRoutine.RoutineExercises;
        Assert.Single(routineExercises);

        var routineExercise = routineExercises.First();
        Assert.Equal(Guid.Parse("231f3f81-4680-4086-b228-168116ae330a"), routineExercise.Uuid);
        Assert.Equal("Push Ups", routineExercise.Name);
        Assert.Equal(3, routineExercise.NumberOfSets);
        Assert.Equal(50, routineExercise.Weight);
        Assert.Equal(120, routineExercise.RestPeriod);
        Assert.Equal(60, routineExercise.WarmUp);
        Assert.Equal(0, routineExercise.Position);

        var emptyLastRoutine = routines.Last();
        Assert.Equal(Guid.Parse("8a94625e-88be-4750-ade2-262cf14aa921"), emptyLastRoutine.Uuid);
        Assert.Equal("Empty First Routine (last touched)", emptyLastRoutine.Name);
        Assert.Equal("any", emptyLastRoutine.NormalDay);
        Assert.Equal(2, emptyLastRoutine.Position);
        Assert.Empty(emptyLastRoutine.RoutineExercises);
    }

    /// <see cref="WorkoutProgramController.Index(WorkoutProgram)" />
    [Fact]
    public async Task Post_SavesANewWorkoutProgramWithChildren()
    {
        // Arrange
        var newWorkoutProgram = new WorkoutProgram
        {
            Uuid = Guid.Parse("3a94e1b9-5709-4d5f-bae8-8db8a3e1b8cc"),
            Name = "Brand New Workout Program",
            UserId = 1,
            WorkoutProgramRoutines = new List<WorkoutProgramRoutine>
            {
                new()
                {
                    Uuid = Guid.Parse("d1a0e7f8-fcfa-44b9-b937-09bf07aebd35"),
                    Name = "Monday",
                    NormalDay = "Monday",
                    Position = 0,
                    RoutineExercises = new List<RoutineExercise>(),
                },
                new()
                {
                    Uuid = Guid.Parse("5d2f2b1a-1e44-4e9e-a7b1-9f0ef47c942d"),
                    Name = "Tuesday",
                    NormalDay = "Tuesday",
                    Position = 1,
                    RoutineExercises = new List<RoutineExercise>
                    {
                        new()
                        {
                            Uuid = Guid.Parse("a89b6c98-e411-4f62-8757-d5764b5941f2"),
                            Name = "Bench",
                            NumberOfSets = 3,
                            Position = 0,
                            Weight = 50,
                            RestPeriod = 120,
                            WarmUp = 60,
                        },
                        new()
                        {
                            Uuid = Guid.Parse("f584f5e0-3b74-4d04-b3b7-5f6b2b2a0d1d"),
                            Name = "Rows",
                            NumberOfSets = 3,
                            Position = 0,
                            Weight = 50,
                            RestPeriod = 120,
                            WarmUp = 60,
                        },
                    },
                },
                new()
                {
                    Uuid = Guid.Parse("7b3a75c7-193f-405f-8eaa-e28f6d8b5f14"),
                    Name = "Thursday",
                    NormalDay = "Thursday",
                    Position = 2,
                    RoutineExercises = new List<RoutineExercise>(),
                },
            },
        };

        var requestJson = JsonConvert.SerializeObject(newWorkoutProgram);
        var content = new StringContent(requestJson, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/workout-programs", content);

        // Assert
        response.EnsureSuccessStatusCode();
        Assert.Equal(
            "application/json; charset=utf-8",
            response.Content.Headers.ContentType!.ToString()
        );
        var json = await response.Content.ReadAsStringAsync();

        var workoutProgram = JsonConvert.DeserializeObject<WorkoutProgram>(json);

        Assert.Equal(Guid.Parse("3a94e1b9-5709-4d5f-bae8-8db8a3e1b8cc"), workoutProgram!.Uuid);
        Assert.Equal("Brand New Workout Program", workoutProgram.Name);
        Assert.Equal(1, workoutProgram.UserId);

        var routines = workoutProgram.WorkoutProgramRoutines;
        Assert.Equal(3, routines.Count);

        var mondayFirst = routines.First();
        Assert.Equal(Guid.Parse("d1a0e7f8-fcfa-44b9-b937-09bf07aebd35"), mondayFirst.Uuid);
        Assert.Equal("Monday", mondayFirst.Name);
        Assert.Equal("Monday", mondayFirst.NormalDay);
        Assert.Equal(0, mondayFirst.Position);
        Assert.Empty(mondayFirst.RoutineExercises);

        var tuesdaySecond = routines.ElementAt(1);
        Assert.Equal(Guid.Parse("5d2f2b1a-1e44-4e9e-a7b1-9f0ef47c942d"), tuesdaySecond.Uuid);
        Assert.Equal("Tuesday", tuesdaySecond.Name);
        Assert.Equal("Tuesday", tuesdaySecond.NormalDay);
        Assert.Equal(1, tuesdaySecond.Position);

        var routineExercises = tuesdaySecond.RoutineExercises;
        Assert.Equal(2, routineExercises.Count);

        var benchFirst = routineExercises.First();
        Assert.Equal(Guid.Parse("a89b6c98-e411-4f62-8757-d5764b5941f2"), benchFirst.Uuid);
        Assert.Equal("Bench", benchFirst.Name);
        Assert.Equal(3, benchFirst.NumberOfSets);
        Assert.Equal(50, benchFirst.Weight);
        Assert.Equal(120, benchFirst.RestPeriod);
        Assert.Equal(60, benchFirst.WarmUp);
        Assert.Equal(0, benchFirst.Position);

        var rowLast = routineExercises.Last();
        Assert.Equal(Guid.Parse("f584f5e0-3b74-4d04-b3b7-5f6b2b2a0d1d"), rowLast.Uuid);
        Assert.Equal("Rows", rowLast.Name);
        Assert.Equal(3, rowLast.NumberOfSets);
        Assert.Equal(50, rowLast.Weight);
        Assert.Equal(120, rowLast.RestPeriod);
        Assert.Equal(60, rowLast.WarmUp);
        Assert.Equal(0, rowLast.Position);

        var thursdayLast = routines.Last();
        Assert.Equal(Guid.Parse("7b3a75c7-193f-405f-8eaa-e28f6d8b5f14"), thursdayLast.Uuid);
        Assert.Equal("Thursday", thursdayLast.Name);
        Assert.Equal("Thursday", thursdayLast.NormalDay);
        Assert.Equal(2, thursdayLast.Position);
        Assert.Empty(thursdayLast.RoutineExercises);
    }

    [Fact]
    public async Task Post_ReturnsBadRequest_WhenWorkoutProgramAlreadyExists()
    {
        // Arrange
        var duplicateWorkoutProgram = new WorkoutProgram
        {
            Uuid = Guid.Parse("186383a6-e369-4071-b80d-70c82d2495d1"),
            Name = "Duplicate Program",
            UserId = 1,
            WorkoutProgramRoutines = new List<WorkoutProgramRoutine>(),
        };

        var content = new StringContent(
            JsonConvert.SerializeObject(duplicateWorkoutProgram),
            Encoding.UTF8,
            "application/json"
        );

        // Act
        var response = await _client.PostAsync("/workout-programs", content);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var responseJson = await response.Content.ReadAsStringAsync();
        var error = JsonConvert.DeserializeAnonymousType(responseJson, new { detail = "" });

        Assert.Equal(
            $"WorkoutProgram with UUID 186383a6-e369-4071-b80d-70c82d2495d1 already exists.",
            error?.detail
        );
    }

    [Fact]
    public async Task Post_ReturnsBadRequest_WhenNamesAreEmpty()
    {
        // Arrange
        var duplicateWorkoutProgram = new WorkoutProgram
        {
            Uuid = Guid.NewGuid(),
            Name = "",
            UserId = 1,
            WorkoutProgramRoutines = new List<WorkoutProgramRoutine>
            {
                new()
                {
                    Uuid = Guid.NewGuid(),
                    Name = "",
                    NormalDay = "Monday",
                    Position = 0,
                    RoutineExercises = new List<RoutineExercise>
                    {
                        new()
                        {
                            Uuid = Guid.NewGuid(),
                            Name = "",
                            NumberOfSets = 3,
                            Position = 0,
                            Weight = 50,
                            RestPeriod = 120,
                            WarmUp = 60,
                        },
                    },
                },
            },
        };

        var content = new StringContent(
            JsonConvert.SerializeObject(duplicateWorkoutProgram),
            Encoding.UTF8,
            "application/json"
        );

        // Act
        var response = await _client.PostAsync("/workout-programs", content);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var responseJson = await response.Content.ReadAsStringAsync();
        var errors = JsonConvert.DeserializeObject<Dictionary<string, string[]>>(responseJson);
        Assert.NotNull(errors);

        Assert.True(errors.ContainsKey("Name"));
        Assert.Contains("Name is required", errors["Name"]);
        Assert.Contains("Name must be between 1 and 100 characters", errors["Name"]);

        Assert.True(errors.ContainsKey("WorkoutProgramRoutines[0].Name"));
        Assert.Contains("Name is required", errors["WorkoutProgramRoutines[0].Name"]);
        Assert.Contains(
            "Name must be between 1 and 100 characters",
            errors["WorkoutProgramRoutines[0].Name"]
        );

        Assert.True(errors.ContainsKey("WorkoutProgramRoutines[0].RoutineExercises[0].Name"));
        Assert.Contains(
            "Name is required",
            errors["WorkoutProgramRoutines[0].RoutineExercises[0].Name"]
        );
        Assert.Contains(
            "Name must be between 1 and 100 characters",
            errors["WorkoutProgramRoutines[0].RoutineExercises[0].Name"]
        );
    }
}
