using System.Net;
using System.Text;
using FluentAssertions;
using LiftTrackerApi.Controllers;
using LiftTrackerApi.Entities;
using LiftTrackerApi.Extensions;
using LiftTrackerApi.Tests.Integration.Fixtures;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace LiftTrackerApi.Tests.Integration;

[Collection("WorkoutProgramTestCollection")]
public class WorkoutProgramControllerTests(WorkoutDbFixture fixture)
    : IClassFixture<WorkoutDbFixture>
{
    private readonly HttpClient _client = fixture.Client;
    private readonly WorkoutDbFixture _fixture = fixture;
    private readonly string _longString =
        "12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901";

    /// <see cref="WorkoutProgramController.Index()" />
    [Fact]
    public async Task Get_EndpointsReturnsEntities()
    {
        // Act
        var response = await _client.GetAsync("/api/workout-programs");

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

        AssertTestProgramStructure(workoutProgram);
    }

    [Fact]
    public async Task Get_EndpointsReturnsSingleByUuid()
    {
        // Act
        var response = await _client.GetAsync(
            "/api/workout-programs/186383a6-e369-4071-b80d-70c82d2495d1"
        );

        // Assert
        response.EnsureSuccessStatusCode();
        Assert.Equal(
            "application/json; charset=utf-8",
            response.Content.Headers.ContentType!.ToString()
        );

        var json = await response.Content.ReadAsStringAsync();
        var workoutProgram = JsonConvert.DeserializeObject<WorkoutProgram>(json);

        Assert.NotNull(workoutProgram);
        AssertTestProgramStructure(workoutProgram);
    }

    private void AssertTestProgramStructure(WorkoutProgram workoutProgram)
    {
        Assert.Equal(Guid.Parse("186383a6-e369-4071-b80d-70c82d2495d1"), workoutProgram.Uuid);
        Assert.Equal("Test Workout Program", workoutProgram.Name);

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

    /// <see cref="WorkoutProgramController.GetByRoutineUuid(Guid)" />
    [Fact]
    public async Task Get_ByRoutineUuid_EndpointsReturnsEntity()
    {
        // Act
        var response = await _client.GetAsync(
            "/api/workout-programs/by-routine/cd218127-b60d-46a7-bbc1-a17332bea15f"
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

    /// <see cref="WorkoutProgramController.GetByRoutineUuid(Guid)" />
    [Fact]
    public async Task Get_ByRoutineUuid_ExcludesSoftDeletedRoutineExercises()
    {
        var db = _fixture.Factory.Services.GetRequiredService<LiftTrackerDbContext>();
        var pushUps = await db
            .RoutineExercises.IgnoreQueryFilters()
            .WhereUuid(Guid.Parse("231f3f81-4680-4086-b228-168116ae330a"))
            .FirstAsync();
        var originalDeletedAt = pushUps.DeletedAt;

        try
        {
            pushUps.DeletedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();

            var response = await _client.GetAsync(
                "/api/workout-programs/by-routine/cd218127-b60d-46a7-bbc1-a17332bea15f"
            );

            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            var workoutProgram = JsonConvert.DeserializeObject<WorkoutProgram>(json);

            var populatedRoutine = workoutProgram!.WorkoutProgramRoutines.Single(routine =>
                routine.Uuid == Guid.Parse("cd218127-b60d-46a7-bbc1-a17332bea15f")
            );
            Assert.Empty(populatedRoutine.RoutineExercises);
        }
        finally
        {
            pushUps.DeletedAt = originalDeletedAt;
            await db.SaveChangesAsync();
        }
    }

    [Fact]
    public async Task Put_SavesProgressionSchemeFields()
    {
        var exerciseUuid = Guid.Parse("231f3f81-4680-4086-b228-168116ae330a");
        var originalExercise = await CaptureRoutineExerciseState(exerciseUuid);

        try
        {
            var response = await _client.GetAsync(
                "/api/workout-programs/186383a6-e369-4071-b80d-70c82d2495d1"
            );
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            var workoutProgram = JsonConvert.DeserializeObject<WorkoutProgram>(json);

            var exercise = workoutProgram!.WorkoutProgramRoutines
                .Single(routine => routine.Uuid == Guid.Parse("cd218127-b60d-46a7-bbc1-a17332bea15f"))
                .RoutineExercises.Single();
            exercise.ProgressionScheme = ProgressionScheme.FiveThreeOne;
            exercise.ProgressionSchemeSettings = new ProgressionScheme531Settings
            {
                CurrentCycleWeek = 2,
                BodyType = ProgressionScheme531BodyType.Upper,
            };
            exercise.Weight = 100m;

            var requestJson = JsonConvert.SerializeObject(workoutProgram);
            var content = new StringContent(requestJson, Encoding.UTF8, "application/json");

            var updateResponse = await _client.PutAsync("/api/workout-programs", content);

            updateResponse.EnsureSuccessStatusCode();
            var updatedJson = await updateResponse.Content.ReadAsStringAsync();
            var updatedWorkoutProgram = JsonConvert.DeserializeObject<WorkoutProgram>(updatedJson);
            var updatedExercise = updatedWorkoutProgram!.WorkoutProgramRoutines
                .Single(routine => routine.Uuid == Guid.Parse("cd218127-b60d-46a7-bbc1-a17332bea15f"))
                .RoutineExercises.Single();

            updatedExercise.ProgressionScheme.Should().Be(ProgressionScheme.FiveThreeOne);
            updatedExercise.ProgressionSchemeSettings!.CurrentCycleWeek.Should().Be(2);
            updatedExercise.ProgressionSchemeSettings.BodyType.Should().Be(
                ProgressionScheme531BodyType.Upper
            );
        }
        finally
        {
            await RestoreRoutineExerciseState(exerciseUuid, originalExercise);
        }
    }

    [Fact]
    public async Task Put_ReturnsBadRequest_WhenFiveThreeOneSettingsAreMissing()
    {
        var exerciseUuid = Guid.Parse("231f3f81-4680-4086-b228-168116ae330a");
        var originalExercise = await CaptureRoutineExerciseState(exerciseUuid);

        try
        {
            var response = await _client.GetAsync(
                "/api/workout-programs/186383a6-e369-4071-b80d-70c82d2495d1"
            );
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            var workoutProgram = JsonConvert.DeserializeObject<WorkoutProgram>(json);

            var exercise = workoutProgram!.WorkoutProgramRoutines
                .Single(routine => routine.Uuid == Guid.Parse("cd218127-b60d-46a7-bbc1-a17332bea15f"))
                .RoutineExercises.Single();
            exercise.ProgressionScheme = ProgressionScheme.FiveThreeOne;
            exercise.ProgressionSchemeSettings = null;
            exercise.Weight = 100m;

            var requestJson = JsonConvert.SerializeObject(workoutProgram);
            var content = new StringContent(requestJson, Encoding.UTF8, "application/json");

            var updateResponse = await _client.PutAsync("/api/workout-programs", content);

            updateResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }
        finally
        {
            await RestoreRoutineExerciseState(exerciseUuid, originalExercise);
        }
    }

    [Fact]
    public async Task PostPut_SavesRotationGroupsAndExerciseMembership()
    {
        var workoutProgramUuid = Guid.NewGuid();
        var routineUuid = Guid.NewGuid();
        var rotationGroupUuid = Guid.NewGuid();
        var firstExerciseUuid = Guid.NewGuid();
        var secondExerciseUuid = Guid.NewGuid();
        var thirdExerciseUuid = Guid.NewGuid();

        var newWorkoutProgram = new WorkoutProgram
        {
            Uuid = workoutProgramUuid,
            Name = "Rotation Group Save Test",
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
                            NextExerciseIndex = 1,
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

        var requestJson = JsonConvert.SerializeObject(newWorkoutProgram);
        var content = new StringContent(requestJson, Encoding.UTF8, "application/json");

        try
        {
            var postResponse = await _client.PostAsync("/api/workout-programs", content);
            postResponse.EnsureSuccessStatusCode();

            var postJson = await postResponse.Content.ReadAsStringAsync();
            var createdWorkoutProgram = JsonConvert.DeserializeObject<WorkoutProgram>(postJson);
            var createdRoutine = createdWorkoutProgram!.WorkoutProgramRoutines.Single();
            var createdExercise = createdRoutine.RoutineExercises.Single(exercise =>
                exercise.Uuid == firstExerciseUuid
            );

            createdRoutine.RoutineExerciseRotationGroups.Should().ContainSingle(group =>
                group.Uuid == rotationGroupUuid && group.NextExerciseIndex == 1
            );
            createdExercise.RotationGroupUuid.Should().Be(rotationGroupUuid);
            createdExercise.RotationGroupPosition.Should().Be(0);

            createdExercise.RotationGroupPosition = 1;
            createdRoutine.RoutineExercises.Single(exercise => exercise.Uuid == secondExerciseUuid)
                .RotationGroupPosition = 0;
            createdRoutine.RoutineExerciseRotationGroups.Single(group =>
                group.Uuid == rotationGroupUuid
            ).NextExerciseIndex = 0;

            var putJson = JsonConvert.SerializeObject(createdWorkoutProgram);
            var putContent = new StringContent(putJson, Encoding.UTF8, "application/json");
            var putResponse = await _client.PutAsync("/api/workout-programs", putContent);

            putResponse.EnsureSuccessStatusCode();

            var getResponse = await _client.GetAsync($"/api/workout-programs/{workoutProgramUuid}");
            getResponse.EnsureSuccessStatusCode();
            var getJson = await getResponse.Content.ReadAsStringAsync();
            var reloadedWorkoutProgram = JsonConvert.DeserializeObject<WorkoutProgram>(getJson);
            var reloadedRoutine = reloadedWorkoutProgram!.WorkoutProgramRoutines.Single();

            reloadedRoutine.RoutineExerciseRotationGroups.Should().ContainSingle(group =>
                group.Uuid == rotationGroupUuid && group.NextExerciseIndex == 0
            );
            reloadedRoutine.RoutineExercises.Single(exercise => exercise.Uuid == firstExerciseUuid)
                .RotationGroupPosition.Should().Be(1);
            reloadedRoutine.RoutineExercises.Single(exercise => exercise.Uuid == secondExerciseUuid)
                .RotationGroupPosition.Should().Be(0);
            reloadedRoutine.RoutineExercises.Single(exercise => exercise.Uuid == thirdExerciseUuid)
                .RotationGroupUuid.Should().BeNull();
        }
        finally
        {
            await _client.DeleteAsync($"/api/workout-programs/{workoutProgramUuid}");
        }
    }

    [Fact]
    public async Task Put_ReturnsBadRequest_WhenRotationGroupReferenceIsUnknown()
    {
        var response = await _client.GetAsync("/api/workout-programs/186383a6-e369-4071-b80d-70c82d2495d1");
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        var workoutProgram = JsonConvert.DeserializeObject<WorkoutProgram>(json);

        var routine = workoutProgram!.WorkoutProgramRoutines
            .Single(r => r.Uuid == Guid.Parse("cd218127-b60d-46a7-bbc1-a17332bea15f"));
        var exercise = routine.RoutineExercises.Single();
        exercise.RotationGroupUuid = Guid.Parse("e4d97140-d462-4d5d-a8b6-619b67d6f0ce");
        exercise.RotationGroupPosition = 0;

        var requestJson = JsonConvert.SerializeObject(workoutProgram);
        var content = new StringContent(requestJson, Encoding.UTF8, "application/json");

        var updateResponse = await _client.PutAsync("/api/workout-programs", content);

        updateResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Put_RemovesRotationGroupsThatHaveNoMembers()
    {
        var response = await _client.GetAsync("/api/workout-programs/186383a6-e369-4071-b80d-70c82d2495d1");
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        var workoutProgram = JsonConvert.DeserializeObject<WorkoutProgram>(json);

        var routine = workoutProgram!.WorkoutProgramRoutines
            .Single(r => r.Uuid == Guid.Parse("cd218127-b60d-46a7-bbc1-a17332bea15f"));
        routine.RoutineExerciseRotationGroups =
        [
            new RoutineExerciseRotationGroup
            {
                Uuid = Guid.NewGuid(),
                NextExerciseIndex = 0,
            },
        ];

        var requestJson = JsonConvert.SerializeObject(workoutProgram);
        var content = new StringContent(requestJson, Encoding.UTF8, "application/json");

        var updateResponse = await _client.PutAsync("/api/workout-programs", content);

        updateResponse.EnsureSuccessStatusCode();
        var updatedJson = await updateResponse.Content.ReadAsStringAsync();
        var updatedWorkoutProgram = JsonConvert.DeserializeObject<WorkoutProgram>(updatedJson);
        updatedWorkoutProgram!.WorkoutProgramRoutines
            .Single(r => r.Uuid == Guid.Parse("cd218127-b60d-46a7-bbc1-a17332bea15f"))
            .RoutineExerciseRotationGroups.Should().BeEmpty();
    }

    private async Task<(decimal? Weight, ProgressionScheme? Scheme, ProgressionScheme531Settings? Settings)> CaptureRoutineExerciseState(
        Guid exerciseUuid
    )
    {
        using var scope = _fixture.Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<LiftTrackerDbContext>();
        var exercise = await db.RoutineExercises.WhereUuid(exerciseUuid).FirstAsync();
        return (
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
    }

    private async Task RestoreRoutineExerciseState(
        Guid exerciseUuid,
        (decimal? Weight, ProgressionScheme? Scheme, ProgressionScheme531Settings? Settings) originalExercise
    )
    {
        using var scope = _fixture.Factory.Services.CreateScope();
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

    /// <see cref="WorkoutProgramController.Create(WorkoutProgram)" />
    /// <see cref="WorkoutProgramController.Update(WorkoutProgram)" />
    [Fact]
    public async Task PostPutDelete_SavesAndDeletesNewWorkoutProgramWithChildren()
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
        var response = await _client.PostAsync("/api/workout-programs", content);

        // Assert
        var createdWorkoutProgram = await AssertSimpleSaveResponse(response);

        // Act
        // We should be able to resave it all without any issues.
        foreach (var routine in createdWorkoutProgram.WorkoutProgramRoutines)
        {
            routine.RoutineExerciseRotationGroups = [];
        }

        var originalPostResponse = JsonConvert.SerializeObject(createdWorkoutProgram);
        var putJson = new StringContent(originalPostResponse, Encoding.UTF8, "application/json");
        var responseFromEdit = await _client.PutAsync("/api/workout-programs", putJson);

        // Assert
        await AssertSimpleSaveResponse(responseFromEdit);

        var responseFromDelete = await _client.DeleteAsync(
            "/api/workout-programs/3a94e1b9-5709-4d5f-bae8-8db8a3e1b8cc"
        );
        responseFromDelete.EnsureSuccessStatusCode();
        Assert.Equal(
            "application/json; charset=utf-8",
            response.Content.Headers.ContentType!.ToString()
        );
    }

    private static async Task<WorkoutProgram> AssertSimpleSaveResponse(HttpResponseMessage response)
    {
        var json = await response.Content.ReadAsStringAsync();
        response.IsSuccessStatusCode.Should().BeTrue(json);

        Assert.Equal(
            "application/json; charset=utf-8",
            response.Content.Headers.ContentType!.ToString()
        );

        var workoutProgram = JsonConvert.DeserializeObject<WorkoutProgram>(json);

        Assert.Equal(Guid.Parse("3a94e1b9-5709-4d5f-bae8-8db8a3e1b8cc"), workoutProgram!.Uuid);
        Assert.Equal("Brand New Workout Program", workoutProgram.Name);

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

        return workoutProgram;
    }

    /// <see cref="WorkoutProgramController.Create(WorkoutProgram)" />
    /// <see cref="WorkoutProgramController.Update(WorkoutProgram)" />
    [Fact]
    public async Task PostPut_SavesAddRemoveEditChildren()
    {
        // Arrange
        var newWorkoutProgram = new WorkoutProgram
        {
            Uuid = Guid.Parse("03e58899-a627-446f-bc52-814835b00661"),
            Name = "Brand New Workout Program 2",
            UserId = 1,
            WorkoutProgramRoutines = new List<WorkoutProgramRoutine>
            {
                new()
                {
                    Uuid = Guid.Parse("5c548292-193d-4d43-b88e-a8c5a8d803ce"),
                    Name = "Monday",
                    NormalDay = "Monday",
                    Position = 0,
                    RoutineExercises = new List<RoutineExercise>(),
                },
                new()
                {
                    Uuid = Guid.Parse("fc7295a9-39dc-4783-922b-e03ff25bc08b"),
                    Name = "Tuesday",
                    NormalDay = "Tuesday",
                    Position = 1,
                    RoutineExercises = new List<RoutineExercise>
                    {
                        new()
                        {
                            Uuid = Guid.Parse("e6356554-056e-4d29-82a9-bfd6883a8959"),
                            Name = "Bench",
                            NumberOfSets = 3,
                            Position = 0,
                            Weight = 50,
                            RestPeriod = 120,
                            WarmUp = 60,
                        },
                        new()
                        {
                            Uuid = Guid.Parse("bbd22132-fc35-4b24-ac00-72523cbe4f04"),
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
                    Uuid = Guid.Parse("1c4f8f7b-a8f0-4097-a765-399eed9e4886"),
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
        var response = await _client.PostAsync("/api/workout-programs", content);

        // Assert
        response.EnsureSuccessStatusCode();

        Assert.Equal(
            "application/json; charset=utf-8",
            response.Content.Headers.ContentType!.ToString()
        );
        var json = await response.Content.ReadAsStringAsync();

        var workoutProgram = JsonConvert.DeserializeObject<WorkoutProgram>(json);

        Assert.Equal(Guid.Parse("03e58899-a627-446f-bc52-814835b00661"), workoutProgram!.Uuid);
        Assert.Equal("Brand New Workout Program 2", workoutProgram.Name);

        var routines = workoutProgram.WorkoutProgramRoutines;
        Assert.Equal(3, routines.Count);

        var mondayFirst = routines.First();
        Assert.Equal(Guid.Parse("5c548292-193d-4d43-b88e-a8c5a8d803ce"), mondayFirst.Uuid);
        Assert.Equal("Monday", mondayFirst.Name);
        Assert.Equal("Monday", mondayFirst.NormalDay);
        Assert.Equal(0, mondayFirst.Position);
        Assert.Empty(mondayFirst.RoutineExercises);

        var tuesdaySecond = routines.ElementAt(1);
        Assert.Equal(Guid.Parse("fc7295a9-39dc-4783-922b-e03ff25bc08b"), tuesdaySecond.Uuid);
        Assert.Equal("Tuesday", tuesdaySecond.Name);
        Assert.Equal("Tuesday", tuesdaySecond.NormalDay);
        Assert.Equal(1, tuesdaySecond.Position);

        var routineExercises = tuesdaySecond.RoutineExercises;
        Assert.Equal(2, routineExercises.Count);

        var benchFirst = routineExercises.First();
        Assert.Equal(Guid.Parse("e6356554-056e-4d29-82a9-bfd6883a8959"), benchFirst.Uuid);
        Assert.Equal("Bench", benchFirst.Name);
        Assert.Equal(3, benchFirst.NumberOfSets);
        Assert.Equal(50, benchFirst.Weight);
        Assert.Equal(120, benchFirst.RestPeriod);
        Assert.Equal(60, benchFirst.WarmUp);
        Assert.Equal(0, benchFirst.Position);

        var rowLast = routineExercises.Last();
        Assert.Equal(Guid.Parse("bbd22132-fc35-4b24-ac00-72523cbe4f04"), rowLast.Uuid);
        Assert.Equal("Rows", rowLast.Name);
        Assert.Equal(3, rowLast.NumberOfSets);
        Assert.Equal(50, rowLast.Weight);
        Assert.Equal(120, rowLast.RestPeriod);
        Assert.Equal(60, rowLast.WarmUp);
        Assert.Equal(0, rowLast.Position);

        var thursdayLast = routines.Last();
        Assert.Equal(Guid.Parse("1c4f8f7b-a8f0-4097-a765-399eed9e4886"), thursdayLast.Uuid);
        Assert.Equal("Thursday", thursdayLast.Name);
        Assert.Equal("Thursday", thursdayLast.NormalDay);
        Assert.Equal(2, thursdayLast.Position);
        Assert.Empty(thursdayLast.RoutineExercises);

        // Arrange
        var editedWorkoutProgram = new WorkoutProgram
        {
            Uuid = Guid.Parse("03e58899-a627-446f-bc52-814835b00661"),
            Name = "Edited Workout Program",
            UserId = 1,
            WorkoutProgramRoutines = new List<WorkoutProgramRoutine>
            {
                new()
                {
                    Uuid = Guid.Parse("8f6de482-47f7-4e3c-8b5d-c5a3aad0e736"),
                    Name = "Sunday",
                    NormalDay = "Sunday",
                    Position = 0,
                    RoutineExercises = new List<RoutineExercise>(),
                },
                new()
                {
                    Uuid = Guid.Parse("5c548292-193d-4d43-b88e-a8c5a8d803ce"),
                    Name = "Monday edited",
                    NormalDay = "Monday",
                    Position = 1,
                    RoutineExercises = new List<RoutineExercise>(),
                },
                new()
                {
                    Uuid = Guid.Parse("fc7295a9-39dc-4783-922b-e03ff25bc08b"),
                    Name = "Tuesday edited",
                    NormalDay = "Tuesday",
                    Position = 2,
                    RoutineExercises = new List<RoutineExercise>
                    {
                        // new() // Deleted
                        // {
                        //     Uuid = Guid.Parse(""),
                        //     Name = "Bench",
                        //     NumberOfSets = 3,
                        //     Position = 0,
                        //     Weight = 50,
                        //     RestPeriod = 120,
                        //     WarmUp = 60,
                        // },
                        new()
                        {
                            Uuid = Guid.Parse("bbd22132-fc35-4b24-ac00-72523cbe4f04"),
                            Name = "Rows",
                            NumberOfSets = 1,
                            Position = 0,
                            Weight = 25,
                            RestPeriod = 60,
                            WarmUp = 30,
                        },
                        new()
                        {
                            Uuid = Guid.Parse("8529ed51-cb6a-47e3-980c-30eac4b7d210"),
                            Name = "OHP",
                            NumberOfSets = 2,
                            Position = 1,
                            Weight = 60,
                            RestPeriod = 90,
                            WarmUp = 60,
                        },
                    },
                },
                // new() // Deleted
                // {
                //     Uuid = Guid.Parse("7b3a75c7-193f-405f-8eaa-e28f6d8b5f14"),
                //     Name = "Thursday",
                //     NormalDay = "Thursday",
                //     Position = 2,
                //     RoutineExercises = new List<RoutineExercise>(),
                // },
            },
        };

        editedWorkoutProgram.Id = null;
        var putRequestJson = JsonConvert.SerializeObject(editedWorkoutProgram);
        var putJson = new StringContent(putRequestJson, Encoding.UTF8, "application/json");
        var responseFromEdit = await _client.PutAsync("/api/workout-programs", putJson);

        // Assert
        responseFromEdit.EnsureSuccessStatusCode();

        Assert.Equal(
            "application/json; charset=utf-8",
            responseFromEdit.Content.Headers.ContentType!.ToString()
        );
        var jsonEdit = await responseFromEdit.Content.ReadAsStringAsync();

        var workoutProgramEdited = JsonConvert.DeserializeObject<WorkoutProgram>(jsonEdit);

        Assert.Equal(
            Guid.Parse("03e58899-a627-446f-bc52-814835b00661"),
            workoutProgramEdited!.Uuid
        );
        Assert.Equal("Edited Workout Program", workoutProgramEdited.Name);

        var routinesEdited = workoutProgramEdited.WorkoutProgramRoutines;
        Assert.Equal(3, routinesEdited.Count);

        var sundayFirst = routinesEdited.First();
        Assert.Equal(Guid.Parse("8f6de482-47f7-4e3c-8b5d-c5a3aad0e736"), sundayFirst.Uuid);
        Assert.Equal("Sunday", sundayFirst.Name);
        Assert.Equal("Sunday", sundayFirst.NormalDay);
        Assert.Equal(0, sundayFirst.Position);
        Assert.Empty(sundayFirst.RoutineExercises);

        var mondayEditedSecond = routinesEdited.ElementAt(1);
        Assert.Equal(Guid.Parse("5c548292-193d-4d43-b88e-a8c5a8d803ce"), mondayEditedSecond.Uuid);
        Assert.Equal("Monday edited", mondayEditedSecond.Name);
        Assert.Equal("Monday", mondayEditedSecond.NormalDay);
        Assert.Equal(1, mondayEditedSecond.Position);
        Assert.Empty(mondayEditedSecond.RoutineExercises);

        var tuesdayEditedThird = routinesEdited.ElementAt(2);
        Assert.Equal(Guid.Parse("fc7295a9-39dc-4783-922b-e03ff25bc08b"), tuesdayEditedThird.Uuid);
        Assert.Equal("Tuesday edited", tuesdayEditedThird.Name);
        Assert.Equal("Tuesday", tuesdayEditedThird.NormalDay);
        Assert.Equal(2, tuesdayEditedThird.Position);

        var routineExercisesEdited = tuesdayEditedThird.RoutineExercises;
        Assert.Equal(2, routineExercisesEdited.Count);

        var benchFirstEdited = routineExercisesEdited.First();
        Assert.Equal(Guid.Parse("bbd22132-fc35-4b24-ac00-72523cbe4f04"), benchFirstEdited.Uuid);
        Assert.Equal("Rows", benchFirstEdited.Name);
        Assert.Equal(1, benchFirstEdited.NumberOfSets);
        Assert.Equal(25, benchFirstEdited.Weight);
        Assert.Equal(60, benchFirstEdited.RestPeriod);
        Assert.Equal(30, benchFirstEdited.WarmUp);
        Assert.Equal(0, benchFirstEdited.Position);

        var ohpLast = routineExercisesEdited.Last();
        Assert.Equal(Guid.Parse("8529ed51-cb6a-47e3-980c-30eac4b7d210"), ohpLast.Uuid);
        Assert.Equal("OHP", ohpLast.Name);
        Assert.Equal(2, ohpLast.NumberOfSets);
        Assert.Equal(60, ohpLast.Weight);
        Assert.Equal(90, ohpLast.RestPeriod);
        Assert.Equal(60, ohpLast.WarmUp);
        Assert.Equal(1, ohpLast.Position);
    }

    /// <see cref="WorkoutProgramController.Create(WorkoutProgram)" />
    /// <see cref="WorkoutProgramController.Update(WorkoutProgram)" />
    [Fact]
    public async Task Put_CanSwapExerciseDay()
    {
        // Arrange
        var newWorkoutProgram = new WorkoutProgram
        {
            Uuid = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Name = "Test Program",
            UserId = 1,
            WorkoutProgramRoutines = new List<WorkoutProgramRoutine>
            {
                new()
                {
                    Uuid = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                    Name = "Monday",
                    NormalDay = "monday",
                    Position = 0,
                    RoutineExercises = new List<RoutineExercise>
                    {
                        new()
                        {
                            Uuid = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                            Name = "Bench Press",
                            NumberOfSets = 3,
                            Position = 0,
                            Weight = 100,
                            RestPeriod = 90,
                            WarmUp = 60,
                        },
                    },
                },
                new()
                {
                    Uuid = Guid.Parse("44444444-4444-4444-4444-444444444444"),
                    Name = "Tuesday",
                    NormalDay = "tuesday",
                    Position = 1,
                    RoutineExercises = new List<RoutineExercise>(),
                },
            },
        };

        var requestJson = JsonConvert.SerializeObject(newWorkoutProgram);
        var content = new StringContent(requestJson, Encoding.UTF8, "application/json");
        await _client.PostAsync("/api/workout-programs", content);

        // Arrange for PUT - moving Bench Press to Wednesday
        var editedProgram = new WorkoutProgram
        {
            Uuid = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Name = "Test Program",
            UserId = 1,
            WorkoutProgramRoutines = new List<WorkoutProgramRoutine>
            {
                new()
                {
                    Uuid = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                    Name = "Monday",
                    NormalDay = "monday",
                    Position = 0,
                    RoutineExercises = new List<RoutineExercise>(),
                },
                new()
                {
                    Uuid = Guid.Parse("44444444-4444-4444-4444-444444444444"),
                    Name = "Tuesday",
                    NormalDay = "tuesday",
                    Position = 1,
                    RoutineExercises = new List<RoutineExercise>
                    {
                        new()
                        {
                            Uuid = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                            Name = "Bench Press",
                            NumberOfSets = 3,
                            Position = 0,
                            Weight = 100,
                            RestPeriod = 90,
                            WarmUp = 60,
                        },
                    },
                },
            },
        };

        var putRequestJson = JsonConvert.SerializeObject(editedProgram);
        var putContent = new StringContent(putRequestJson, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PutAsync("/api/workout-programs", putContent);

        // Assert
        response.EnsureSuccessStatusCode();
        var jsonResponse = await response.Content.ReadAsStringAsync();
        var updatedProgram = JsonConvert.DeserializeObject<WorkoutProgram>(jsonResponse);

        // Verify Monday has no exercises
        var monday = updatedProgram!.WorkoutProgramRoutines.First();
        Assert.Empty(monday.RoutineExercises);

        // Verify Wednesday has the Bench Press
        var tuesday = updatedProgram.WorkoutProgramRoutines.Last();
        Assert.Single(tuesday.RoutineExercises);
        var benchPress = tuesday.RoutineExercises.First();
        Assert.Equal("Bench Press", benchPress.Name);
        Assert.Equal(Guid.Parse("33333333-3333-3333-3333-333333333333"), benchPress.Uuid);
    }

    /// <see cref="WorkoutProgramController.Create(WorkoutProgram)" />
    /// <see cref="WorkoutProgramController.Update(WorkoutProgram)" />
    [Fact]
    public async Task Put_CanDeleteExercisesAndRoutines()
    {
        // Arrange
        var newWorkoutProgram = new WorkoutProgram
        {
            Uuid = Guid.Parse("a1111111-1111-1111-1111-111111111111"),
            Name = "Test Program",
            UserId = 1,
            WorkoutProgramRoutines = new List<WorkoutProgramRoutine>
            {
                new()
                {
                    Uuid = Guid.Parse("a2222222-2222-2222-2222-222222222222"),
                    Name = "Monday",
                    NormalDay = "monday",
                    Position = 0,
                    RoutineExercises = new List<RoutineExercise>
                    {
                        new()
                        {
                            Uuid = Guid.Parse("a3333333-3333-3333-3333-333333333333"),
                            Name = "Bench Press",
                            NumberOfSets = 3,
                            Position = 0,
                            Weight = 100,
                            RestPeriod = 90,
                            WarmUp = 60,
                        },
                    },
                },
                new()
                {
                    Uuid = Guid.Parse("a4444444-4444-4444-4444-444444444444"),
                    Name = "Tuesday",
                    NormalDay = "tuesday",
                    Position = 1,
                    RoutineExercises = new List<RoutineExercise>(),
                },
            },
        };

        // Arrange
        var requestJson = JsonConvert.SerializeObject(newWorkoutProgram);
        var content = new StringContent(requestJson, Encoding.UTF8, "application/json");
        await _client.PostAsync("/api/workout-programs", content);

        // Arrange
        var editedProgram = new WorkoutProgram
        {
            Uuid = Guid.Parse("a1111111-1111-1111-1111-111111111111"),
            Name = "Emptied program",
            UserId = 1,
            WorkoutProgramRoutines = new List<WorkoutProgramRoutine>(),
        };

        var putRequestJson = JsonConvert.SerializeObject(editedProgram);
        var putContent = new StringContent(putRequestJson, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PutAsync("/api/workout-programs", putContent);

        // Assert
        response.EnsureSuccessStatusCode();
        var jsonResponse = await response.Content.ReadAsStringAsync();
        var updatedProgram = JsonConvert.DeserializeObject<WorkoutProgram>(jsonResponse);

        // Verify Monday has no exercises
        Assert.Empty(updatedProgram!.WorkoutProgramRoutines);
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
        var response = await _client.PostAsync("/api/workout-programs", content);

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
    public async Task Post_ReturnsBadRequest_WhenNamesAreTooLong()
    {
        // Arrange
        var duplicateWorkoutProgram = new WorkoutProgram
        {
            Uuid = Guid.NewGuid(),
            Name = _longString,
            UserId = 1,
            WorkoutProgramRoutines = new List<WorkoutProgramRoutine>
            {
                new()
                {
                    Uuid = Guid.NewGuid(),
                    Name = _longString,
                    NormalDay = "Monday",
                    Position = 0,
                    RoutineExercises = new List<RoutineExercise>
                    {
                        new()
                        {
                            Uuid = Guid.NewGuid(),
                            Name = _longString,
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
        var response = await _client.PostAsync("/api/workout-programs", content);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var responseJson = await response.Content.ReadAsStringAsync();
        var problems = JsonConvert.DeserializeObject<ValidationProblemDetails>(responseJson);

        problems.Should().NotBeNull();
        problems.Title.Should().Be("One or more validation errors occurred.");

        var errors = problems.Errors;

        errors.Should().ContainKey("Name");
        errors["Name"].Should().Contain("Name must be at most 100 characters");

        errors.Should().ContainKey("WorkoutProgramRoutines[0].Name");
        errors["WorkoutProgramRoutines[0].Name"]
            .Should()
            .Contain("Name must be at most 100 characters");
        errors["WorkoutProgramRoutines[0].Name"]
            .Should()
            .Contain("Name must be at most 100 characters");

        errors.Should().ContainKey("WorkoutProgramRoutines[0].RoutineExercises[0].Name");
        errors["WorkoutProgramRoutines[0].RoutineExercises[0].Name"]
            .Should()
            .Contain("Name must be at most 100 characters");
        errors["WorkoutProgramRoutines[0].RoutineExercises[0].Name"]
            .Should()
            .Contain("Name must be at most 100 characters");
    }

    [Fact]
    public async Task Put_ReturnsBadRequest_WhenRoutineExercisePayloadIsBlank()
    {
        var editedProgram = new WorkoutProgram
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
                    RoutineExercises = new List<RoutineExercise>(),
                },
                new()
                {
                    Uuid = Guid.Parse("cd218127-b60d-46a7-bbc1-a17332bea15f"),
                    Name = "Populated Routine",
                    NormalDay = "any",
                    Position = 1,
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
                            Uuid = Guid.Parse("90000000-0000-0000-0000-000000000001"),
                            Name = null,
                            NumberOfSets = null,
                            Position = 1,
                            Weight = null,
                            RestPeriod = null,
                            WarmUp = null,
                        },
                    },
                },
                new()
                {
                    Uuid = Guid.Parse("8a94625e-88be-4750-ade2-262cf14aa921"),
                    Name = "Empty First Routine (last touched)",
                    NormalDay = "any",
                    Position = 2,
                    RoutineExercises = new List<RoutineExercise>(),
                },
            },
        };

        var content = new StringContent(
            JsonConvert.SerializeObject(editedProgram),
            Encoding.UTF8,
            "application/json"
        );

        var response = await _client.PutAsync("/api/workout-programs", content);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var responseJson = await response.Content.ReadAsStringAsync();
        responseJson.Should().Contain(
            "Routine exercise payload is blank. Name or training fields must be provided."
        );
    }

    [Fact]
    public async Task Put_AllowsRoutineExerciseWithOnlyRpe()
    {
        var originalResponse = await _client.GetAsync(
            "/api/workout-programs/186383a6-e369-4071-b80d-70c82d2495d1"
        );
        originalResponse.EnsureSuccessStatusCode();
        var originalProgram = JsonConvert.DeserializeObject<WorkoutProgram>(
            await originalResponse.Content.ReadAsStringAsync()
        );

        var editedProgram = new WorkoutProgram
        {
            Uuid = Guid.Parse("186383a6-e369-4071-b80d-70c82d2495d1"),
            Name = "Test Workout Program",
            UserId = 1,
            WorkoutProgramRoutines =
            [
                new WorkoutProgramRoutine
                {
                    Uuid = Guid.Parse("073379e9-0bc1-4f69-9cd5-1b0e7074d1a3"),
                    Name = "Empty First Routine",
                    NormalDay = "any",
                    Position = 0,
                    RoutineExercises = [],
                },
                new WorkoutProgramRoutine
                {
                    Uuid = Guid.Parse("cd218127-b60d-46a7-bbc1-a17332bea15f"),
                    Name = "Populated Routine",
                    NormalDay = "any",
                    Position = 1,
                    RoutineExercises =
                    [
                        new RoutineExercise
                        {
                            Uuid = Guid.Parse("231f3f81-4680-4086-b228-168116ae330a"),
                            Name = "Push Ups",
                            NumberOfSets = 3,
                            Position = 0,
                            Weight = 50,
                            RestPeriod = 120,
                            WarmUp = 60,
                        },
                        new RoutineExercise
                        {
                            Uuid = Guid.Parse("90000000-0000-0000-0000-000000000002"),
                            Name = null,
                            NumberOfSets = null,
                            Position = 1,
                            Weight = null,
                            Rpe = 7,
                            RestPeriod = null,
                            WarmUp = null,
                        },
                    ],
                },
                new WorkoutProgramRoutine
                {
                    Uuid = Guid.Parse("8a94625e-88be-4750-ade2-262cf14aa921"),
                    Name = "Empty First Routine (last touched)",
                    NormalDay = "any",
                    Position = 2,
                    RoutineExercises = [],
                },
            ],
        };

        var content = new StringContent(
            JsonConvert.SerializeObject(editedProgram),
            Encoding.UTF8,
            "application/json"
        );

        try
        {
            var response = await _client.PutAsync("/api/workout-programs", content);

            response.EnsureSuccessStatusCode();

            var responseJson = await response.Content.ReadAsStringAsync();
            var workoutProgram = JsonConvert.DeserializeObject<WorkoutProgram>(responseJson);
            workoutProgram!
                .WorkoutProgramRoutines.Single(routine =>
                    routine.Uuid == Guid.Parse("cd218127-b60d-46a7-bbc1-a17332bea15f")
                )
                .RoutineExercises.Should()
                .ContainSingle(exercise =>
                    exercise.Uuid == Guid.Parse("90000000-0000-0000-0000-000000000002")
                    && exercise.Rpe == 7
                );
        }
        finally
        {
            var restoreContent = new StringContent(
                JsonConvert.SerializeObject(originalProgram),
                Encoding.UTF8,
                "application/json"
            );
            var restoreResponse = await _client.PutAsync(
                "/api/workout-programs",
                restoreContent
            );
            restoreResponse.EnsureSuccessStatusCode();
        }
    }

    [Fact]
    public async Task Put_ReturnsBadRequest_WhenRoutineExerciseRpeIsOutOfRange()
    {
        var editedProgram = new WorkoutProgram
        {
            Uuid = Guid.Parse("186383a6-e369-4071-b80d-70c82d2495d1"),
            Name = "Test Workout Program",
            UserId = 1,
            WorkoutProgramRoutines =
            [
                new WorkoutProgramRoutine
                {
                    Uuid = Guid.Parse("073379e9-0bc1-4f69-9cd5-1b0e7074d1a3"),
                    Name = "Empty First Routine",
                    NormalDay = "any",
                    Position = 0,
                    RoutineExercises = [],
                },
                new WorkoutProgramRoutine
                {
                    Uuid = Guid.Parse("cd218127-b60d-46a7-bbc1-a17332bea15f"),
                    Name = "Populated Routine",
                    NormalDay = "any",
                    Position = 1,
                    RoutineExercises =
                    [
                        new RoutineExercise
                        {
                            Uuid = Guid.Parse("231f3f81-4680-4086-b228-168116ae330a"),
                            Name = "Push Ups",
                            NumberOfSets = 3,
                            Position = 0,
                            Weight = 50,
                            RestPeriod = 120,
                            WarmUp = 60,
                        },
                        new RoutineExercise
                        {
                            Uuid = Guid.Parse("90000000-0000-0000-0000-000000000003"),
                            Name = "Rpe only",
                            NumberOfSets = null,
                            Position = 1,
                            Weight = null,
                            Rpe = 11,
                            RestPeriod = null,
                            WarmUp = null,
                        },
                    ],
                },
                new WorkoutProgramRoutine
                {
                    Uuid = Guid.Parse("8a94625e-88be-4750-ade2-262cf14aa921"),
                    Name = "Empty First Routine (last touched)",
                    NormalDay = "any",
                    Position = 2,
                    RoutineExercises = [],
                },
            ],
        };

        var content = new StringContent(
            JsonConvert.SerializeObject(editedProgram),
            Encoding.UTF8,
            "application/json"
        );

        var response = await _client.PutAsync("/api/workout-programs", content);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var responseJson = await response.Content.ReadAsStringAsync();
        responseJson.Should().Contain("RPE must be between 1 and 10");
    }
}
