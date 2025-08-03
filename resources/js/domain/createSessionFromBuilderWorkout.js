import { utcNow } from '../dates';
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
        workoutProgramRoutine: null,
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
              workoutProgramRoutine: originWorkout,
          }
        : {
              uuid: UuidHelper.assign(),
              name: originWorkout.name,
              startedAt,
              endedAt: null,
              createdAt: null, // Critical for knowing when we can fetch the previous exercises.
              workoutProgramRoutine: originWorkout,
          };

    if (originWorkout.routineExercises.length === 0) {
        session.sessionExercises = [
            createExerciseForEmptyWorkout(originWorkout.name),
        ];
    } else {
        session.sessionExercises = originWorkout.routineExercises.map(
            createSessionExerciseFromBuilderExercise
        );
    }

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
    return {
        uuid: UuidHelper.assign(),
        name: builderExercise.name || 'Unnamed exercise',
        plannedWeight: builderExercise.weight,
        plannedRestPeriodDuration: builderExercise.restPeriod,
        plannedWarmUp: builderExercise.warmUp,
        position: builderExercise.position,
        sessionSets: Array.from({ length: builderExercise.numberOfSets }).map(
            (value, index) => {
                return {
                    uuid: UuidHelper.assign(),
                    weight: builderExercise.weight,
                    position: index,
                    startedAt: null,
                    createdAt: utcNow(),
                };
            }
        ),
        routineExercise: {
            uuid: builderExercise.uuid,
        },
        createdAt: utcNow(),
    };
}
