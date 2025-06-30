using LiftTrackerApi.Controllers;
using LiftTrackerApi.Entities;
using LiftTrackerApi.Tests.Integration.Fixtures;
using Newtonsoft.Json;

namespace LiftTrackerApi.Tests.Integration;

[Collection("WorkoutProgramTestCollection")]
public class WorkoutProgramControllerTests(WorkoutProgramDbFixture fixture)
    : IClassFixture<WorkoutProgramDbFixture>
{
    private readonly HttpClient _client = fixture.Client;

    /// <see cref="WorkoutProgramController.Index" />
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
        Assert.Single(workoutPrograms!);

        var workoutProgram = workoutPrograms!.First();
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

    /// <see cref="WorkoutProgramController.Index" />
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
}
