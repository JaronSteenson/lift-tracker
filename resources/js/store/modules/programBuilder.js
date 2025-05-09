import WorkoutProgramService from '../../api/WorkoutProgramService';
import UuidHelper from '../../UuidHelper';
import { dateTimeDescription, utcNow } from '../../dates';
import { debounce, pick } from '../../util/index';
import {
    mutations as saveStatusMutations,
    actions as saveStatusActions,
    state as saveStatusState,
} from './saveStatusMixin';

const SAVE_DEBOUNCE_WAIT = 1000;
const LOCAL_STORAGE_KEY = 'store-state--ProgramBuilder';

function sortByPosition(a, b) {
    return a.position < b.position ? 1 : 0;
}

function defaultState() {
    return {
        ...saveStatusState,
        justAddedModelUuid: null,
        hasMadeSignificantChangesFromNew: false,
        inFocusProgram: {
            uuid: null,
            name: '',
            workoutProgramRoutines: [],
            createdAt: null,
            updatedAt: null,
            isDirty: false,
        },
        delayedSavingToServer: false,
        myWorkoutPrograms: [],
        myWorkoutProgramsIsLoading: false,
    };
}

const state = defaultState();

const workoutFields = [
    'uuid',
    'name',
    'normalDay',
    'position',
    'routineExercises',
];

const exerciseFields = [
    'uuid',
    'name',
    'position',
    'numberOfSets',
    'position',
    'weight',
    'restPeriod',
    'warmUp',
];

const getters = {
    myRoutines(state, getters, rootState) {
        const routines = state.myWorkoutPrograms.reduce(
            (carry, workoutProgram) => {
                const withExtraFields =
                    workoutProgram.workoutProgramRoutines.map((routine) => ({
                        ...routine,
                        workoutProgram,
                        latestSession: rootState[
                            'workoutSession'
                        ].myWorkoutSessions.find(
                            (workoutSession) =>
                                routine.uuid ===
                                workoutSession.originRoutineUuid
                        ),
                    }));

                return carry.concat(withExtraFields);
            },
            []
        );

        return routines.sort(
            (a, b) => a?.latestSession?.createdAt - b?.latestSession?.createdAt
        );
    },

    hasMadeSignificantChangesFromNew(state) {
        return Boolean(
            state.inFocusProgram.uuid || // Has somehow forced a save or uuid assignment.
                state.inFocusProgram.name.trim() !== '' || // Has added a name.
                state.inFocusProgram.workoutProgramRoutines.length > 1 || // Has added a workout.
                state.inFocusProgram.workoutProgramRoutines[0]?.name || // Has a name for the first routine.
                state.inFocusProgram.workoutProgramRoutines[0]?.routineExercises
                    .length > 0
        ); // Has added an exercise to the first routine.
    },

    isJustAddedModelUuid: (state) => (uuid) => {
        return state.justAddedModelUuid === uuid;
    },

    getWorkout: (state) => (uuid) => {
        return {
            ...UuidHelper.findIn(
                state.inFocusProgram.workoutProgramRoutines,
                uuid
            ),
            workoutProgram: state.inFocusProgram,
        };
    },

    getOrderedWorkouts(state) {
        return [...state.inFocusProgram.workoutProgramRoutines].sort((a, b) => {
            return a.position - b.position;
        });
    },

    getOrderedExercises: (state, getters) => (workoutUuid) => {
        const workout = getters.getWorkout(workoutUuid);

        return [...workout.routineExercises].sort((a, b) => {
            return a.position - b.position;
        });
    },

    getExercise: (state) => (uuid) => {
        let exercise = null;

        state.inFocusProgram.workoutProgramRoutines.some(function (workout) {
            let found = UuidHelper.findIn(workout.routineExercises, uuid);

            if (found) {
                exercise = found;
                return true; // Early exit.
            }
        });

        return exercise;
    },

    savePayload(state) {
        const cleaned = { ...state.inFocusProgram };

        cleaned.workoutProgramRoutines =
            state.inFocusProgram.workoutProgramRoutines.map((workout) => {
                const cleanedWorkout = pick(workout, workoutFields);

                cleanedWorkout.routineExercises =
                    cleanedWorkout.routineExercises.map((exercise) =>
                        pick(exercise, exerciseFields)
                    );

                return cleanedWorkout;
            });

        return cleaned;
    },

    myWorkoutPrograms(state) {
        if (state.myWorkoutPrograms === null) {
            return null;
        }

        return state.myWorkoutPrograms.map((workoutProgram) => {
            return {
                ...workoutProgram,
                updatedAtDescription: dateTimeDescription(
                    workoutProgram.updatedAt
                ),
            };
        });
    },

    forLocalStorageSave(state) {
        return {
            ...state,
            myWorkoutPrograms: state.myWorkoutPrograms.slice(0, 10),
        };
    },

    fromLocalStorage() {
        return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    },
};

const actions = {
    ...saveStatusActions,
    async fetchMyWorkoutPrograms({ commit, rootGetters }) {
        if (rootGetters['app/userIsLocalOnly']) {
            return;
        }
        commit('reset', { myWorkoutProgramsIsLoading: true });
        const myWorkoutPrograms = await WorkoutProgramService.getAll();

        commit('reset', {
            myWorkoutPrograms,
            myWorkoutProgramsIsLoading: false,
        });
    },

    startNew({ state, commit }) {
        commit('reset', {
            ...defaultState(),
            inFocusProgram: {
                /**  {@link hasMadeSignificantChangesFromNew} */
                uuid: null,
                name: 'New Workout Program',
                workoutProgramRoutines: [
                    {
                        uuid: UuidHelper.assign(),
                        name: 'Workout 1',
                        normalDay: 'Monday',
                        position: 0,
                        routineExercises: [],
                    },
                ],
                /**  {@link markUpdated} */
                createdAt: null,
                updatedAt: null,
                isDirty: false,
            },
            myWorkoutPrograms: state.myWorkoutPrograms,
        });
    },

    updateName({ commit, dispatch }, name) {
        commit('updateName', name);

        dispatch('save');
    },

    updateWorkout({ state, commit, dispatch }, { uuid, name }) {
        const workout = UuidHelper.findIn(
            state.inFocusProgram.workoutProgramRoutines,
            uuid
        );

        commit('updateWorkout', { workout, newState: { name } });

        dispatch('save');
    },

    updateWorkoutPositionFromOrder({ commit, dispatch }, orderedWorkouts) {
        commit('updateWorkoutPositionFromOrder', orderedWorkouts);

        dispatch('save');
    },

    updateExercisePositionFromOrder(
        { state, commit, dispatch },
        { workoutUuid, newOrderedExercises }
    ) {
        const existingOrderedExercises = UuidHelper.findIn(
            state.inFocusProgram.workoutProgramRoutines,
            workoutUuid
        ).routineExercises;

        let fromAnotherWorkout = null;

        // If the new ordered exercises are larger then
        // we have received an exercise from another workout.
        if (newOrderedExercises.length > existingOrderedExercises.length) {
            newOrderedExercises.some((newOrderedExercise, index) => {
                if (
                    newOrderedExercise.uuid !==
                    existingOrderedExercises[index]?.uuid
                ) {
                    fromAnotherWorkout = newOrderedExercise;
                    return true; // Early exit.
                }
            });
        }

        // Figure out which workout this came from.
        if (fromAnotherWorkout) {
            const exercisesOriginalWorkout =
                state.inFocusProgram.workoutProgramRoutines.find((workout) => {
                    return UuidHelper.findIn(
                        workout.routineExercises,
                        fromAnotherWorkout.uuid
                    );
                });

            const withOutMovedExercise = UuidHelper.removeFromCopy(
                exercisesOriginalWorkout.routineExercises,
                fromAnotherWorkout.uuid
            );

            commit('updateExercisePositionFromOrder', {
                workoutUuid: exercisesOriginalWorkout.uuid,
                newOrderedExercises: withOutMovedExercise,
            });
        }

        commit('updateExercisePositionFromOrder', {
            workoutUuid,
            newOrderedExercises,
        });

        dispatch('save');
    },

    addWorkoutToProgram({ state, commit, dispatch }, workout) {
        if (!workout) {
            workout = { name: null };
        }

        if (!workout.position) {
            workout.position =
                state.inFocusProgram.workoutProgramRoutines.length;
        }

        if (!workout.routineExercises) {
            workout.routineExercises = [];
        }

        UuidHelper.assignTo(workout);

        commit('addWorkout', workout);
        commit('setJustAddedUuid', workout.uuid);

        dispatch('save');
    },

    addExerciseToWorkout({ commit }, { workoutUuid }) {
        const uuid = UuidHelper.assign();

        commit('addExerciseToWorkout', { uuid, workoutUuid });
        commit('setJustAddedUuid', uuid);

        // Don't save, we might abort the addition of this exercise, we instead force a save adding a name.
        // dispatch('save');
    },

    forgetJustAddedUuid({ commit }) {
        commit('setJustAddedUuid', null);
    },

    deleteWorkout({ commit, dispatch }, { workoutUuid }) {
        commit('deleteWorkout', { workoutUuid });

        commit('fixPositions');

        dispatch('save');
    },

    deleteExercise({ commit, dispatch }, { exerciseUuid }) {
        commit('deleteExercise', { exerciseUuid });

        commit('fixPositions');

        dispatch('save');
    },

    updateExercise(
        { commit, getters, dispatch },
        { exerciseUuid, ...newState }
    ) {
        const exercise = getters.getExercise(exerciseUuid);

        commit('updateExercise', { exercise, newState });

        dispatch('save');
    },

    async delete({ state, commit, dispatch, rootGetters }, uuid) {
        try {
            const uuidToDelete = uuid || state.inFocusProgram.uuid;
            const updatedWorkoutPrograms = UuidHelper.removeFromCopy(
                state.myWorkoutPrograms,
                uuidToDelete
            );

            commit('reset', { myWorkoutPrograms: updatedWorkoutPrograms }); // Optimistically remove from the state.

            if (!rootGetters['app/userIsLocalOnly']) {
                await WorkoutProgramService.delete(uuidToDelete);
            }
        } catch (error) {
            dispatch('finishSavingError');

            commit('reset', { myWorkoutPrograms: state.myWorkoutPrograms }); // Rollback the remove from the state.
        }
    },

    save: debounce(
        async ({ state, commit, dispatch, getters, rootGetters }) => {
            // Don't actually save anything until there are some decent changes.
            if (!getters.hasMadeSignificantChangesFromNew) {
                return;
            }

            dispatch('startSaving');

            // We still don't have a top level uuid, but we have made some changes,
            // assign a UUID and actually save the program.
            if (
                !state.inFocusProgram.uuid &&
                getters.hasMadeSignificantChangesFromNew
            ) {
                commit('assignTopLevelUuid');
            }

            if (state.delayedSavingToServer) {
                return;
            }

            try {
                if (rootGetters['app/userIsLocalOnly']) {
                    commit('markUpdated');
                } else {
                    const response = await WorkoutProgramService.save(
                        getters.savePayload
                    );

                    commit('patchInSaveResponse', response.data);
                }

                const updatedWorkoutPrograms = UuidHelper.replaceInCopy(
                    state.myWorkoutPrograms,
                    state.inFocusProgram
                );

                commit('reset', { myWorkoutPrograms: updatedWorkoutPrograms });
                dispatch('saveToLocalStorage');

                dispatch('finishSaving');
            } catch (error) {
                dispatch('finishSavingError');
            }
        },
        SAVE_DEBOUNCE_WAIT
    ),

    saveToLocalStorage({ getters }) {
        localStorage.setItem(
            LOCAL_STORAGE_KEY,
            JSON.stringify(getters.forLocalStorageSave)
        );
    },

    async fetch({ commit, rootGetters }, uuid) {
        if (rootGetters['app/userIsLocalOnly']) {
            return;
        }

        const response = await WorkoutProgramService.get(uuid);
        commit('reset', {
            inFocusProgram: response.data,
            delayedSavingToServer: false,
        });
    },

    async prepareForSessionOverview({ commit, rootGetters }, routineUuid) {
        if (rootGetters['app/userIsLocalOnly']) {
            return;
        }

        const response = await WorkoutProgramService.getByRoutine(routineUuid);
        commit('reset', {
            inFocusProgram: response.data,
            delayedSavingToServer: true,
        });
    },

    saveIfDirty({ state, getters, rootGetters, dispatch }) {
        if (state.inFocusProgram.isDirty) {
            if (rootGetters['app/userIsLocalOnly']) {
                dispatch('saveToLocalStorage');
            } else {
                return WorkoutProgramService.save(getters.savePayload);
            }
        }

        return Promise.resolve(state.inFocusProgram);
    },
};

const mutations = {
    ...saveStatusMutations,

    restoreDefault(state) {
        const originalState = defaultState();

        Object.keys(originalState).forEach((key) => {
            state[key] = originalState[key];
        });
    },

    reset(state, newState) {
        Object.keys(newState || {}).forEach((key) => {
            state[key] = newState[key];
        });
    },

    assignTopLevelUuid(state) {
        state.inFocusProgram.uuid = UuidHelper.assign();
    },

    setJustAddedUuid(state, uuid) {
        state.justAddedModelUuid = uuid;
    },

    updateName(state, name) {
        state.inFocusProgram.name = name;
    },

    updateWorkout(state, { workout, newState }) {
        Object.keys(newState).forEach((key) => {
            workout[key] = newState[key];
        });
        state.inFocusProgram.isDirty = true;
    },

    updateWorkoutPositionFromOrder(state, orderedWorkouts) {
        orderedWorkouts.forEach((workout, updatedPosition) => {
            workout.position = updatedPosition;
        });

        state.inFocusProgram.workoutProgramRoutines = orderedWorkouts;
        state.inFocusProgram.isDirty = true;
    },

    updateExercisePositionFromOrder(
        state,
        { workoutUuid, newOrderedExercises }
    ) {
        newOrderedExercises.forEach((exercise, updatedPosition) => {
            exercise.position = updatedPosition;
        });

        const workout = UuidHelper.findIn(
            state.inFocusProgram.workoutProgramRoutines,
            workoutUuid
        );
        workout.routineExercises = newOrderedExercises;
        state.inFocusProgram.isDirty = true;
    },

    updateExercise(state, { exercise, newState }) {
        Object.keys(newState).forEach((key) => {
            exercise[key] = newState[key];
        });
        state.inFocusProgram.isDirty = true;
    },

    addExerciseToWorkout(state, { uuid, workoutUuid }) {
        const workout = UuidHelper.findIn(
            state.inFocusProgram.workoutProgramRoutines,
            workoutUuid
        );

        workout.routineExercises.push({
            uuid,
            name: null,
            weight: null,
            numberOfSets: 3,
            warmUp: 2 * 60, // 2 minutes in seconds.
            restPeriod: 2 * 60, // 2 minutes in seconds.
            position: workout.routineExercises.length,
        });
        state.inFocusProgram.isDirty = true;
    },

    deleteExercise(state, { exerciseUuid }) {
        // Use some to early exit if the exercise was found and removed.
        state.inFocusProgram.workoutProgramRoutines.some((workout) => {
            return UuidHelper.removeFrom(
                workout.routineExercises,
                exerciseUuid
            );
        });
        state.inFocusProgram.isDirty = true;
    },

    deleteWorkout(state, { workoutUuid }) {
        UuidHelper.removeFrom(
            state.inFocusProgram.workoutProgramRoutines,
            workoutUuid
        );
        state.inFocusProgram.isDirty = true;
    },

    fixPositions(state) {
        state.inFocusProgram.workoutProgramRoutines.sort(sortByPosition);
        state.inFocusProgram.workoutProgramRoutines.forEach(
            (workout, index) => {
                workout.position = index;

                workout.routineExercises.sort(sortByPosition);
                workout.routineExercises.forEach((exercise, index) => {
                    exercise.position = index;
                });
            }
        );
    },

    addWorkout(state, workout) {
        if (state.inFocusProgram.workoutProgramRoutines.length === 0) {
            state.inFocusProgram.workoutProgramRoutines.push(workout);
            return;
        }

        // Bump the positions off all routines that come after the one we are adding.
        state.inFocusProgram.workoutProgramRoutines.forEach(
            (existingWorkout) => {
                if (existingWorkout.position >= workout.position) {
                    existingWorkout.position++;
                }
            }
        );

        state.inFocusProgram.workoutProgramRoutines.splice(
            workout.position,
            0,
            workout
        );
        state.inFocusProgram.isDirty = true;
    },

    patchInSaveResponse(state, saveResponse) {
        // Nothing should be different from the server except the creation date. And uuid if it was assigned there.
        state.inFocusProgram.uuid = saveResponse.uuid;
        state.inFocusProgram.createdAt = saveResponse.createdAt;
        state.inFocusProgram.updatedAt = saveResponse.updatedAt;
    },

    markUpdated(state) {
        const now = utcNow();
        if (!state.inFocusProgram.createdAt) {
            state.inFocusProgram.createdAt = now;
        }
        state.inFocusProgram.updatedAt = now;
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
