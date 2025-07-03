using LiftTrackerApi.Controllers;
using LiftTrackerApi.Entities;
using LiftTrackerApi.Tests.Integration.Fixtures;
using Newtonsoft.Json;

namespace LiftTrackerApi.Tests.Integration;

[Collection("WorkoutProgramTestCollection")]
public class WorkoutProgramRoutineControllerTests(WorkoutProgramDbFixture fixture)
    : IClassFixture<WorkoutProgramDbFixture>
{
    private readonly HttpClient _client = fixture.Client;

    /// <see cref="WorkoutProgramRoutineController.Index" />
    [Fact]
    public async Task Get_EndpointsReturnsEntities()
    {
        // Act
        var response = await _client.GetAsync("/routines");

        // Assert
        response.EnsureSuccessStatusCode();
        Assert.Equal(
            "application/json; charset=utf-8",
            response.Content.Headers.ContentType!.ToString()
        );
        var json = await response.Content.ReadAsStringAsync();

        var routines = JsonConvert.DeserializeObject<List<WorkoutProgramRoutine>>(json);
        Assert.Equal(3, routines!.Count);

        // Last-touched routine should be the first one in the list, rather than the typical first position.
        var lastTouchedRoutine = routines.First();
        Assert.Equal(Guid.Parse("8a94625e-88be-4750-ade2-262cf14aa921"), lastTouchedRoutine.Uuid);
        Assert.Equal("Empty First Routine (last touched)", lastTouchedRoutine.Name);
        Assert.Equal("any", lastTouchedRoutine.NormalDay);
        Assert.Equal(2, lastTouchedRoutine.Position);
        Assert.Empty(lastTouchedRoutine.RoutineExercises);
        if (lastTouchedRoutine != null)
            Assert.Equal("Test Workout Program", lastTouchedRoutine!.WorkoutProgram!.Name);

        var emptyRoutineSecond = routines.ElementAt(1);
        Assert.Equal(Guid.Parse("073379e9-0bc1-4f69-9cd5-1b0e7074d1a3"), emptyRoutineSecond.Uuid);
        Assert.Equal("Empty First Routine", emptyRoutineSecond.Name);
        Assert.Equal("any", emptyRoutineSecond.NormalDay);
        Assert.Equal(0, emptyRoutineSecond.Position);
        Assert.Equal("Test Workout Program", emptyRoutineSecond.WorkoutProgram!.Name);
        Assert.Empty(emptyRoutineSecond.RoutineExercises);

        var populatedLastRoutine = routines.Last();
        Assert.Equal(Guid.Parse("cd218127-b60d-46a7-bbc1-a17332bea15f"), populatedLastRoutine.Uuid);
        Assert.Equal("Populated Routine", populatedLastRoutine.Name);
        Assert.Equal("any", populatedLastRoutine.NormalDay);
        Assert.Equal(1, populatedLastRoutine.Position);
        Assert.Single(populatedLastRoutine.RoutineExercises);

        var routineExercise = populatedLastRoutine.RoutineExercises.First();
        Assert.Equal(Guid.Parse("231f3f81-4680-4086-b228-168116ae330a"), routineExercise.Uuid);
        Assert.Equal("Push Ups", routineExercise.Name);
        Assert.Equal(3, routineExercise.NumberOfSets);
        Assert.Equal(50, routineExercise.Weight);
        Assert.Equal(120, routineExercise.RestPeriod);
        Assert.Equal(60, routineExercise.WarmUp);
        Assert.Equal(0, routineExercise.Position);
    }
}
