namespace LiftTrackerApi.Entities;

public static class RoutineExerciseRotationValidation
{
    public static IEnumerable<(string Key, string Message)> ValidateWorkoutProgram(
        WorkoutProgram workoutProgram
    )
    {
        for (
            var routineIndex = 0;
            routineIndex < workoutProgram.WorkoutProgramRoutines.Count;
            routineIndex++
        )
        {
            var routine = workoutProgram.WorkoutProgramRoutines.ElementAt(routineIndex);
            var routinePath = $"WorkoutProgramRoutines[{routineIndex}]";
            var groups = routine.RoutineExerciseRotationGroups.ToList();
            var exercises = routine.RoutineExercises.ToList();
            var groupUuids = groups
                .Where(group => group.Uuid.HasValue)
                .Select(group => group.Uuid!.Value)
                .ToHashSet();

            for (var groupIndex = 0; groupIndex < groups.Count; groupIndex++)
            {
                if (!groups[groupIndex].Uuid.HasValue)
                {
                    yield return (
                        $"{routinePath}.RoutineExerciseRotationGroups[{groupIndex}].Uuid",
                        "Rotation groups must include a UUID."
                    );
                }
            }

            var membershipMap = exercises
                .Where(exercise => exercise.RotationGroupUuid.HasValue)
                .GroupBy(exercise => exercise.RotationGroupUuid!.Value)
                .ToDictionary(group => group.Key, group => group.ToList());

            foreach (var exerciseGroup in membershipMap)
            {
                if (!groupUuids.Contains(exerciseGroup.Key))
                {
                    yield return (
                        $"{routinePath}.RoutineExercises",
                        $"Routine exercise references unknown rotation group {exerciseGroup.Key}."
                    );
                    continue;
                }

                var duplicatePositions = exerciseGroup
                    .Value.Where(exercise => exercise.RotationGroupPosition.HasValue)
                    .GroupBy(exercise => exercise.RotationGroupPosition!.Value)
                    .Where(group => group.Count() > 1)
                    .Select(group => group.Key)
                    .ToList();

                if (duplicatePositions.Count > 0)
                {
                    yield return (
                        $"{routinePath}.RoutineExercises",
                        $"Rotation group {exerciseGroup.Key} has duplicate rotation positions."
                    );
                }

                foreach (
                    var exercise in exerciseGroup.Value.Where(exercise =>
                        !exercise.RotationGroupPosition.HasValue
                    )
                )
                {
                    yield return (
                        $"{routinePath}.RoutineExercises",
                        $"Routine exercise {exercise.Uuid} must include rotationGroupPosition when assigned to a rotation group."
                    );
                }
            }

            foreach (
                var exercise in exercises.Where(exercise => !exercise.RotationGroupUuid.HasValue)
            )
            {
                if (exercise.RotationGroupPosition.HasValue)
                {
                    yield return (
                        $"{routinePath}.RoutineExercises",
                        $"Routine exercise {exercise.Uuid} cannot set rotationGroupPosition without a rotationGroupUuid."
                    );
                }
            }
        }
    }
}
