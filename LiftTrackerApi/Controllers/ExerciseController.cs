using LiftTrackerApi.Entities;
using LiftTrackerApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace LiftTrackerApi.Controllers;

[ApiController]
[Route("/api/exercise")]
public class ExerciseController(
    WorkoutProgramService workoutProgramService,
    ProgressionSchemeRegistry progressionSchemeRegistry
) : Controller
{
    [HttpGet("{uuid:guid}/cycle-projection")]
    public async Task<IActionResult> GetCycleProjection(
        Guid uuid,
        [FromQuery] decimal? trainingMax,
        [FromQuery] int? currentCycleWeek,
        [FromQuery] ProgressionScheme531BodyType? bodyType
    )
    {
        var userId = (int)(HttpContext.Items["UserId"] ?? -1);
        var exercise = await workoutProgramService.FindRoutineExerciseByUuidAndOwner(uuid, userId);

        if (exercise.ProgressionScheme != ProgressionScheme.FiveThreeOne)
        {
            return BadRequest(new { error = "Cycle projection is only available for 531 exercises." });
        }

        var effectiveExercise = workoutProgramService.CreateProjectionExerciseOverride(
            exercise,
            trainingMax,
            currentCycleWeek,
            bodyType
        );

        try
        {
            var strategy = progressionSchemeRegistry.GetRequiredStrategy(
                effectiveExercise.ProgressionScheme
            );
            return Json(strategy.CreateProjection(effectiveExercise));
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { error = exception.Message });
        }
    }
}
