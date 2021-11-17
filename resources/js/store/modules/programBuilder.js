import WorkoutProgramService from '../../api/WorkoutProgramService'
import UuidHelper from '../../UuidHelper'
import { dateTimeDescription } from "../../dates";
import { debounce, pick } from '../../util';
import {
    mutations as saveStatusMutations,
    actions as saveStatusActions,
    state as saveStatusState,
    getters as savingStatusGetters,
} from './saveStatusMixin';

const LOCAL_STORAGE_NAMESPACE = 'program-builder-state';
const SAVE_DEBOUNCE_WAIT = 1000;

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
        },
        delayedSavingToServer: false,
        myWorkoutPrograms: null,
    }
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
];

const getters = {
    ...savingStatusGetters,

    hasMadeSignificantChangesFromNew(state) {
        return Boolean(state.inFocusProgram.uuid || // Has somehow forced a save or uuid assignment.
            state.inFocusProgram.name.trim() !== '' || // Has added a name.
            state.inFocusProgram.workoutProgramRoutines.length > 1 || // Has added a workout.
            state.inFocusProgram.workoutProgramRoutines[0]?.name || // Has a name for the first routine.
            state.inFocusProgram.workoutProgramRoutines[0]?.routineExercises.length > 0); // Has added an exercise to the first routine.
    },

    isJustAddedModelUuid: (state) => (uuid) => {
        return state.justAddedModelUuid === uuid
    },

    getWorkout: (state) => (uuid) => {
        return UuidHelper.findIn(state.inFocusProgram.workoutProgramRoutines, uuid);
    },

    getOrderedWorkouts(state) {
        return [...state.inFocusProgram.workoutProgramRoutines].sort((a, b) => {
            return a.position - b.position;
        })
    },

    getOrderedExercises: (state, getters) => (workoutUuid) => {
        const workout = getters.getWorkout(workoutUuid);

        return [...workout.routineExercises].sort((a, b) => {
            return a.position - b.position;
        })
    },

    getExercise: (state) => (uuid) => {
        let exercise = null;

        state.inFocusProgram.workoutProgramRoutines.some(function (workout) {
            let found =  UuidHelper.findIn(workout.routineExercises, uuid);

            if (found) {
                exercise = found;
                return true; // Early exit.
            }
        });

        return exercise;
    },

    savePayload(state) {
        const cleaned = { ...state.inFocusProgram }

        cleaned.workoutProgramRoutines = state.inFocusProgram.workoutProgramRoutines.map(workout => {
            const cleanedWorkout = pick(workout, workoutFields);

            cleanedWorkout.routineExercises = cleanedWorkout.routineExercises.map(
                exercise => pick(exercise, exerciseFields)
            );

            return cleanedWorkout;
        });

        return cleaned;
    },

    myWorkoutPrograms(state) {
        if (state.myWorkoutPrograms === null) {
            return null;
        }

        return state.myWorkoutPrograms.map(workoutProgram => {
            return {
                ...workoutProgram,
                ...{
                    updatedAtDescription: dateTimeDescription(workoutProgram.updatedAt)
                },
            };
        })
    },

};

const actions = {
    ...saveStatusActions,
    startNew({ state, commit }) {
        commit('reset', { ...defaultState(), myWorkoutPrograms: state.myWorkoutPrograms });
    },

    updateName({ state, commit, dispatch }, name) {
        commit('updateName', name);

        dispatch('save')
    },

    updateWorkout({ state, commit, dispatch }, { uuid, name }) {
        const workout = UuidHelper.findIn(state.inFocusProgram.workoutProgramRoutines, uuid);

        commit('updateWorkout', { workout, newState: { name }  });

        dispatch('save');
    },

    updateWorkoutPositionFromOrder({ state, commit, dispatch }, orderedWorkouts) {
        commit('updateWorkoutPositionFromOrder', orderedWorkouts);

        dispatch('save');
    },

    updateExercisePositionFromOrder({ state, commit, dispatch }, { workoutUuid, newOrderedExercises }) {
        const existingOrderedExercises = UuidHelper.findIn(state.inFocusProgram.workoutProgramRoutines, workoutUuid).routineExercises;

        let fromAnotherWorkout = null;

        // If the new ordered exercises are larger then
        // we have received an exercise from another workout.
        if (newOrderedExercises.length > existingOrderedExercises.length) {
            newOrderedExercises.some((newOrderedExercise, index) => {
                if (newOrderedExercise.uuid !== existingOrderedExercises[index]?.uuid) {
                    fromAnotherWorkout = newOrderedExercise;
                    return true; // Early exit.
                }
            });
        }

        // Figure out which workout this came from.
        if (fromAnotherWorkout) {

            const exercisesOriginalWorkout = state.inFocusProgram.workoutProgramRoutines.find(workout => {
                return UuidHelper.findIn(workout.routineExercises, fromAnotherWorkout.uuid);
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

        commit('updateExercisePositionFromOrder', { workoutUuid, newOrderedExercises });

        dispatch('save');
    },

    addWorkoutToProgram({ state, commit, dispatch }, workout) {
        if (!workout) {
            workout = { name: null };
        }

        if (!workout.position) {
            workout.position = state.inFocusProgram.workoutProgramRoutines.length;
        }

        if (!workout.routineExercises) {
            workout.routineExercises = [];
        }

        UuidHelper.assignTo(workout);

        commit('addWorkout', workout);
        commit('setJustAddedUuid', workout.uuid);

        dispatch('save');
    },

    addExerciseToWorkout({ state, commit, dispatch }, { workoutUuid }) {
        const uuid = UuidHelper.assign();

        commit('addExerciseToWorkout', { uuid, workoutUuid });
        commit('setJustAddedUuid', uuid);

        // Don't save, we might abort the addition of this exercise, we instead force a save adding a name.
        // dispatch('save');
    },

    forgetJustAddedUuid({ commit }) {
        commit('setJustAddedUuid', null);
    },

    deleteWorkout({ state, commit, dispatch }, { workoutUuid }) {
        commit('deleteWorkout', { workoutUuid });

        commit('fixPositions');

        dispatch('save');
    },

    deleteExercise({ state, commit, dispatch }, { exerciseUuid }) {
        commit('deleteExercise', { exerciseUuid });

        commit('fixPositions');

        dispatch('save')
    },

    updateExercise({ state, commit, getters, dispatch }, { exerciseUuid, ...newState }) {
        const exercise = getters.getExercise(exerciseUuid);

        commit('updateExercise', { exercise, newState });

        dispatch('save')
    },

    async archive({ state, commit, dispatch }, uuid) {
        try {
            const uuidToDelete = uuid || state.inFocusProgram.uuid;
            const updatedWorkoutPrograms = UuidHelper.removeFromCopy(state.myWorkoutPrograms, uuidToDelete)

            commit('reset', { myWorkoutPrograms: updatedWorkoutPrograms }); // Optimistically remove from the state.

            await WorkoutProgramService.delete(uuidToDelete);
        } catch (error) {
            console.error(error);
            dispatch('finishSavingError');

            commit('reset', { myWorkoutPrograms: state.myWorkoutPrograms }); // Rollback the remove from the state.
        }
    },

    save: debounce(async ({ state, commit, dispatch, getters }) => {
         // Don't actually save anything until there is some decent changes.
        if (!getters.hasMadeSignificantChangesFromNew) {
            return;
        }

        dispatch('startSaving');

        // We still don't have a top level uuid, but we have made some changes,
        // assign a uuid and actually save the program.
        if (!state.inFocusProgram.uuid && getters.hasMadeSignificantChangesFromNew) {
            commit('assignTopLevelUuid');
        }

        if (state.delayedSavingToServer) {
            return;
        }

        try {
            const response = await WorkoutProgramService.save(getters.savePayload);
            commit('patchInSaveResponse', response.data);

            const updatedWorkoutPrograms = UuidHelper.replaceInCopy(state.myWorkoutPrograms, state.inFocusProgram);
            commit('reset', { myWorkoutPrograms: updatedWorkoutPrograms });

            dispatch('finishSaving');
        } catch (error) {
            console.error(error);
            dispatch('finishSavingError');
        }

    }, SAVE_DEBOUNCE_WAIT),

    async fetch({ commit, dispatch }, uuid) {
        const response = await WorkoutProgramService.get(uuid);
        commit('reset', {
            inFocusProgram: response.data,
            delayedSavingToServer: false,
        });
    },

    async prepareForSessionOverview({ commit, dispatch }, routineUuid) {
        const response = await WorkoutProgramService.getByRoutine(routineUuid);
        commit('reset', {
            inFocusProgram: response.data,
            delayedSavingToServer: true,
        });
    },

    async saveChangesFormSessionSetup({ getters }) {
        return WorkoutProgramService.save(getters.savePayload);
    },

    async fetchMyWorkoutPrograms({ commit }) {
        const response = await WorkoutProgramService.getAll();

        commit('reset', { myWorkoutPrograms: response.data })
    },

};

const mutations = {
    ...saveStatusMutations,

    restoreDefault(state) {
        const originalState = defaultState();

        Object.keys(originalState).forEach(key => {
            state[key] = originalState[key];
        });
    },

    reset(state, newState) {
        Object.keys(newState).forEach(key => {
            state[key] = newState[key]
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
        Object.keys(newState).forEach(key => {
            workout[key] = newState[key]
        })
    },

    updateWorkoutPositionFromOrder(state, orderedWorkouts) {
        orderedWorkouts.forEach((workout, updatedPosition) => { workout.position = updatedPosition; });

        state.inFocusProgram.workoutProgramRoutines = orderedWorkouts;
    },

    updateExercisePositionFromOrder(state, { workoutUuid, newOrderedExercises }) {
        newOrderedExercises.forEach((exercise, updatedPosition) => { exercise.position = updatedPosition; });

        const workout = UuidHelper.findIn(state.inFocusProgram.workoutProgramRoutines, workoutUuid);
        workout.routineExercises = newOrderedExercises;
    },

    updateExercise(state, { exercise, newState }) {
        Object.keys(newState).forEach(key => {
            exercise[key] = newState[key]
        })
    },

    addExerciseToWorkout(state, { uuid, workoutUuid }) {
        const workout = UuidHelper.findIn(state.inFocusProgram.workoutProgramRoutines, workoutUuid);

        workout.routineExercises.push({
            uuid,
            name: null,
            weight: null,
            numberOfSets: 3,
            restPeriod: 2 * 60, // 2 minutes in seconds.
            position: workout.routineExercises.length
        });
    },

    deleteExercise(state, { exerciseUuid }) {
        // Use some to early exit if the exercise was found and removed.
        state.inFocusProgram.workoutProgramRoutines.some(workout => {
            return UuidHelper.removeFrom(workout.routineExercises, exerciseUuid);
        });
    },

    deleteWorkout(state, { workoutUuid }) {
        UuidHelper.removeFrom(state.inFocusProgram.workoutProgramRoutines, workoutUuid);
    },

    fixPositions(state) {
        state.inFocusProgram.workoutProgramRoutines.sort(sortByPosition);
        state.inFocusProgram.workoutProgramRoutines.forEach((workout, index) => {
            workout.position = index;

            workout.routineExercises.sort(sortByPosition);
            workout.routineExercises.forEach((exercise, index) => {
                exercise.position = index;
            });
        });
    },

    addWorkout(state, workout) {
        if (state.inFocusProgram.workoutProgramRoutines.length === 0) {
            state.inFocusProgram.workoutProgramRoutines.push(workout);
            return;
        }

        // Bump the positions off all routines that come after the one we are adding.
        state.inFocusProgram.workoutProgramRoutines.forEach(existingWorkout => {
            if (existingWorkout.position >= workout.position) {
                existingWorkout.position++;
            }
        });

        state.inFocusProgram.workoutProgramRoutines.splice(workout.position, 0, workout);
    },

    patchInSaveResponse(state, saveResponse) {
        // Nothing should be different from the server except the create date. And uuid if it was assigned there.
        state.inFocusProgram.uuid = saveResponse.uuid;
        state.inFocusProgram.createdAt = saveResponse.createdAt;
        state.inFocusProgram.updatedAt = saveResponse.updatedAt;
    },

};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
