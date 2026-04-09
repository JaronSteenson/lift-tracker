using LiftTrackerApi.Entities;
using LiftTrackerApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace LiftTrackerApi.Controllers;

[ApiController]
[Route("/api/workout-programs")]
public class WorkoutProgramController(
    WorkoutProgramService workoutProgramService,
    ILogger<WorkoutProgramController> logger
) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index()
    {
        var userId = (int)(HttpContext.Items["UserId"] ?? -1);

        var workoutPrograms = await workoutProgramService.FindWorkoutProgramsForUserId(userId);
        return Json(workoutPrograms);
    }

    [HttpGet("{uuid:guid}")]
    public async Task<IActionResult> Get(Guid uuid)
    {
        var userId = (int)(HttpContext.Items["UserId"] ?? -1);

        var workoutProgram = await workoutProgramService.FindByUuidAndOwner(uuid, userId);
        return Json(workoutProgram);
    }

    [HttpGet("by-routine/{routineUuid:guid}")]
    public async Task<IActionResult> GetByRoutineUuid(Guid routineUuid)
    {
        var userId = (int)(HttpContext.Items["UserId"] ?? -1);

        var workoutProgram = await workoutProgramService.FindWorkoutProgramByRoutineUuid(
            routineUuid,
            userId
        );
        return Json(workoutProgram);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] WorkoutProgram workoutProgram)
    {
        var userId = (int)(HttpContext.Items["UserId"] ?? -1);
        ValidateRoutineExercises(workoutProgram, userId);

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var created = await workoutProgramService.CreateWithChildren(workoutProgram, userId);
        return Json(created);
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] WorkoutProgram workoutProgram)
    {
        var userId = (int)(HttpContext.Items["UserId"] ?? -1);
        ValidateRoutineExercises(workoutProgram, userId);

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var updated = await workoutProgramService.UpdateWithChildren(workoutProgram, userId);
        return Json(updated);
    }

    [HttpDelete("{uuid:guid}")]
    public async Task Delete(Guid uuid)
    {
        var userId = (int)(HttpContext.Items["UserId"] ?? -1);

        await workoutProgramService.DeleteWorkoutProgram(uuid, userId);
    }

    private void ValidateRoutineExercises(WorkoutProgram workoutProgram, int userId)
    {
        for (var routineIndex = 0; routineIndex < workoutProgram.WorkoutProgramRoutines.Count; routineIndex++)
        {
            var routine = workoutProgram.WorkoutProgramRoutines.ElementAt(routineIndex);

            for (
                var exerciseIndex = 0;
                exerciseIndex < routine.RoutineExercises.Count;
                exerciseIndex++
            )
            {
                var exercise = routine.RoutineExercises.ElementAt(exerciseIndex);
                if (!IsBlankRoutineExercise(exercise))
                {
                    continue;
                }

                logger.LogWarning(
                    "Rejected blank RoutineExercise payload for user {UserId}. Program {ProgramUuid}, routine {RoutineUuid}, exercise {ExerciseUuid}, position {Position}.",
                    userId,
                    workoutProgram.Uuid,
                    routine.Uuid,
                    exercise.Uuid,
                    exercise.Position
                );

                ModelState.AddModelError(
                    $"WorkoutProgramRoutines[{routineIndex}].RoutineExercises[{exerciseIndex}]",
                    "Routine exercise payload is blank. Name or training fields must be provided."
                );
            }
        }
    }

    private static bool IsBlankRoutineExercise(RoutineExercise exercise)
    {
        return string.IsNullOrWhiteSpace(exercise.Name)
            && exercise.NumberOfSets == null
            && exercise.Weight == null
            && exercise.RestPeriod == null
            && exercise.WarmUp == null;
    }
}
