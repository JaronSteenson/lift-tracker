using LiftTrackerApi.Dtos;
using LiftTrackerApi.Entities;

namespace LiftTrackerApi.Services;

public interface IProgressionSchemeStrategy
{
    ProgressionScheme Scheme { get; }
    ExerciseCycleProjectionDto CreateProjection(RoutineExercise routineExercise);
    SessionExercise CreateSessionExercise(RoutineExercise routineExercise);
    void Advance(RoutineExercise routineExercise);
}
