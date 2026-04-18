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
