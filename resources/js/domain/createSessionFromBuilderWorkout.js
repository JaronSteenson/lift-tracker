import { utcNow } from '../dates/index';
import UuidHelper from '../UuidHelper';

/**
 * Check-in/records are just sessions without exercises and start/end times.
 */
export function createCheckIn() {
    return {
        uuid: UuidHelper.assign(),
        name: 'Check-in',
        notes: null,
        bodyWeight: null,
        startedAt: null,
        endedAt: null,
        createdAt: null,
        workoutProgramRoutineUuid: null,
        workoutProgramRoutineName: null,
        workoutProgramUuid: null,
        workoutProgramName: null,
        sessionExercises: [],
    };
}

export default function createSessionFromBuilderWorkout({
    existingCheckIn,
    originWorkout,
}) {
    const startedAt = utcNow();

    const session = existingCheckIn
        ? {
              ...existingCheckIn,
              startedAt,
              name: originWorkout.name,
              workoutProgramRoutineUuid: originWorkout.uuid || null,
              workoutProgramRoutineName: originWorkout.name || null,
              workoutProgramUuid:
                  originWorkout.workoutProgramUuid ||
                  originWorkout.workoutProgram?.uuid ||
                  null,
              workoutProgramName:
                  originWorkout.workoutProgramName ||
                  originWorkout.workoutProgram?.name ||
                  null,
          }
        : {
              uuid: UuidHelper.assign(),
              name: originWorkout.name,
              notes: null,
              bodyWeight: null,
              startedAt,
              endedAt: null,
              createdAt: null, // Critical for knowing when we can fetch the previous exercises.
              workoutProgramRoutineUuid: originWorkout.uuid || null,
              workoutProgramRoutineName: originWorkout.name || null,
              workoutProgramUuid:
                  originWorkout.workoutProgramUuid ||
                  originWorkout.workoutProgram?.uuid ||
                  null,
              workoutProgramName:
                  originWorkout.workoutProgramName ||
                  originWorkout.workoutProgram?.name ||
                  null,
              sessionExercises: [], // Will be populated below
          };

    if (originWorkout.routineExercises.length === 0) {
        session.sessionExercises = [
            createExerciseForEmptyWorkout(originWorkout.name),
        ];
    } else {
        session.sessionExercises = originWorkout.routineExercises.map(
            createSessionExerciseFromBuilderExercise,
        );
    }

    // Set startedAt on the first set if it exists
    session.sessionExercises[0].sessionSets[0].startedAt = startedAt;

    return session;
}

function createExerciseForEmptyWorkout(name) {
    return {
        uuid: UuidHelper.assign(),
        name,
        position: 0,
        plannedWeight: null,
        plannedRestPeriodDuration: null,
        plannedWarmUp: null,
        sessionSets: [
            {
                uuid: UuidHelper.assign(),
                weight: null,
                position: 0,
                startedAt: null,
            },
        ],
        routineExerciseUuid: null,
    };
}

function createSessionExerciseFromBuilderExercise(builderExercise) {
    const now = utcNow();

    return {
        uuid: UuidHelper.assign(),
        name: builderExercise.name || 'Unnamed exercise',
        notes: builderExercise.notes || null,
        plannedWeight: builderExercise.weight,
        position: builderExercise.position,
        skipped: false,
        warmUpDuration: builderExercise.warmUp,
        sessionSets: Array.from({
            length: builderExercise.numberOfSets || 1,
        }).map((value, index) => {
            return {
                uuid: UuidHelper.assign(),
                weight: builderExercise.weight,
                restPeriodDuration: builderExercise.restPeriod,
                position: index,
                startedAt: null,
                createdAt: now,
                updatedAt: now,
            };
        }),
        routineExerciseUuid: builderExercise.uuid,
        createdAt: now,
        updatedAt: now,
    };
}
