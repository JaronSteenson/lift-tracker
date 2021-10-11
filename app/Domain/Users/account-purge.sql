delete
    SessionSets,
    SessionExercises,
    WorkoutSessions,
    RoutineExercises,
    WorkoutProgramRoutines,
    WorkoutPrograms,
    Users
from Users
         left join WorkoutSessions on WorkoutSessions.userId = Users.id
         left join SessionExercises on SessionExercises.workoutSessionId = WorkoutSessions.id
         left join SessionSets on SessionSets.sessionExerciseId = SessionExercises.id

         left join WorkoutPrograms on WorkoutPrograms.userId = Users.id
         left join WorkoutProgramRoutines on workoutProgramId = WorkoutPrograms.id
         left join RoutineExercises on RoutineExercises.workoutProgramRoutineId = WorkoutProgramRoutines.id
where Users.id = ?;
