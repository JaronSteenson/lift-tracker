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
              notes: null,
              bodyWeight: null,
              startedAt,
              endedAt: null,
              createdAt: null, // Critical for knowing when we can fetch the previous exercises.
              workoutProgramRoutine: originWorkout,
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
    if (
        session.sessionExercises &&
        session.sessionExercises.length > 0 &&
        session.sessionExercises[0].sessionSets &&
        session.sessionExercises[0].sessionSets.length > 0
    ) {
        session.sessionExercises[0].sessionSets[0].startedAt = startedAt;
    }

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
        notes: builderExercise.notes || null,
        plannedWeight: builderExercise.weight,
        plannedRestPeriodDuration: builderExercise.restPeriodInSeconds,
        plannedWarmUp: builderExercise.warmUp || 0,
        position: builderExercise.position,
        skipped: false,
        sessionSets: Array.from({ length: builderExercise.sets || 3 }).map(
            (value, index) => {
                return {
                    uuid: UuidHelper.assign(),
                    weight: builderExercise.weight,
                    position: index,
                    startedAt: null,
                    createdAt: utcNow(),
                };
            },
        ),
        routineExercise: {
            uuid: builderExercise.uuid,
        },
        createdAt: utcNow(),
    };
}
