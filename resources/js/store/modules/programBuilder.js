import WorkoutProgramService from '../../api/WorkoutProgramService'
import UuidHelper from '../../UuidHelper'
import { debounce, pick } from 'lodash';

const LOCAL_STORAGE_NAMESPACE = 'program-builder-state';
const SAVE_DEBOUNCE_WAIT = 2000;

function localStorageKey(uuid) {
    return `${LOCAL_STORAGE_NAMESPACE}_${uuid}`
}

function sortByPosition(a, b) {
    return a < b ? 1 : 0;
}

const state = {
    uuid: null,
    name: '',
    workoutProgramRoutines: [],
    justAddedModelUuid: null,
    hasMadeSignificantChangesFromNew: false,
    createdAt: null,
};

const workoutProgramFields = [
    'uuid',
    'name',
    'workoutProgramRoutines',
    'createdAt', // Used for determining http method.
];

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
];

const getters = {

    hasMadeSignificantChangesFromNew(state) {
        return state.uuid || // Has somehow forced a save or uuid assignment.
            state.name.trim() !== '' || // Has added a name.
            state.workoutProgramRoutines.length > 1 || // Has added a workout.
            state.workoutProgramRoutines[0]?.name.trim() !== '' || // Has a name for the first routine.
            state.workoutProgramRoutines[0]?.routineExercises.length > 0; // Has added an exercise to the first routine.
    },

    fromLocalStorage(state) {
        return JSON.parse(localStorage.getItem(localStorageKey(state.uuid)));
    },

    isJustAddedModelUuid: (state) => (uuid) => {
        return state.justAddedModelUuid === uuid
    },

    getWorkout: (state) => (uuid) => {
        return UuidHelper.findIn(state.workoutProgramRoutines, uuid);
    },

    getWorkoutNameForDisplay: (state, getters) => (uuid) => {
        return getters.getWorkout(uuid).name || 'Unnamed workout';
    },

    getExerciseNameForDisplay: (state, getters) => (uuid) => {
        return getters.getExercise(uuid).name || 'Unnamed exercise';
    },

    getOrderedWorkouts(state) {
        return [...state.workoutProgramRoutines].sort((a, b) => {
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

        state.workoutProgramRoutines.some(function (workout) {
            let found =  UuidHelper.findIn(workout.routineExercises, uuid);

            if (found) {
                exercise = found;
                return true; // Early exit.
            }
        });

        return exercise;
    },

    isNewWorkoutInExistingProgram: (state, getters) => (uuid) => {
        const workout = getters.getWorkout(uuid);

        return state.id && !workout.id;
    },

    isNewExercise: (state, getters) => (uuid) => {
        const exercise = getters.getExercise(uuid);

        return !exercise.id
    },

    savePayload(state) {
        const cleaned = pick(state, workoutProgramFields);

        cleaned.workoutProgramRoutines = state.workoutProgramRoutines.map(workout => {
            const cleanedWorkout = pick(workout, workoutFields);

            cleanedWorkout.routineExercises = cleanedWorkout.routineExercises.map(
                exercise => pick(exercise, exerciseFields)
            );

            return cleanedWorkout;
        });

        return cleaned;
    }

};

const actions = {
    startNew({ commit }) {
        commit('reset', {
            // We don't assign a uuid or save until the user does something (add a name, workout, or exercise).
            uuid: null,
            name: '',
            workoutProgramRoutines: [
                {
                    uuid: UuidHelper.assign(),
                    name: '',
                    position: 0,
                    routineExercises: [],
                }
            ],
        });
    },

    updateName({ state, commit, dispatch }, name) {
        commit('updateName', name);

        dispatch('save')
    },

    updateWorkoutName({ state, commit, dispatch }, { uuid, name }) {
        const workout = UuidHelper.findIn(state.workoutProgramRoutines, uuid);

        commit('updateWorkout', { workout, newState: { name }  });

        dispatch('save');
    },

    updateWorkoutPositionFromOrder({ state, commit, dispatch }, orderedWorkouts) {
        commit('updateWorkoutPositionFromOrder', orderedWorkouts);

        dispatch('save');
    },

    updateExercisePositionFromOrder({ state, commit, dispatch }, { workoutUuid, newOrderedExercises }) {
        const existingOrderedExercises = UuidHelper.findIn(state.workoutProgramRoutines, workoutUuid).routineExercises;

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
            debugger;
            const exercisesOriginalWorkout = state.workoutProgramRoutines.find(workout => {
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
            workout.position = state.workoutProgramRoutines.length;
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

        dispatch('save');
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

    save: debounce(async ({ state, commit, dispatch, getters }) => {
        // Don't actually save anything until there is some decent changes.
        if (!getters.hasMadeSignificantChangesFromNew) {
            return;
        }

        //  We still don't have a top level uuid, but we have made some changes,
        // assign a uuid and actually save the program.
        if (!state.uuid && getters.hasMadeSignificantChangesFromNew) {
            commit('assignTopLevelUuid');
        }

        dispatch('saveToLocalStorage');

        try {
            const response = await WorkoutProgramService.save(getters.savePayload);
            commit('patchInSaveResponse', response.data);
        } catch (error) {
            console.error(error); // TODO add to toast queue/user facing error message.
        }

    }, SAVE_DEBOUNCE_WAIT),

    saveToLocalStorage({ state }) {
        localStorage.setItem(localStorageKey(state.uuid), JSON.stringify(state));
    },

    async fetch({ commit, dispatch }, uuid) {
        try {
            const response = await WorkoutProgramService.get(uuid);
            commit('reset', response.data);
        } catch (e) {
            dispatch('tryRestoreFromLocalStorage')
        }
    },

    tryRestoreFromLocalStorage({ commit, getters, dispatch }) {
        const stateFromLocalStorage = getters.fromLocalStorage;

        if (stateFromLocalStorage) {
            commit('reset', stateFromLocalStorage);
        } else {
            dispatch('startNew');
        }
    },

};

const mutations = {
    reset(state, newState) {
        Object.keys(newState).forEach(key => {
            state[key] = newState[key]
        });
    },

    assignTopLevelUuid(state) {
        state.uuid = UuidHelper.assign();
    },

    setJustAddedUuid(state, uuid) {
        state.justAddedModelUuid = uuid;
    },

    updateName(state, name) {
        state.name = name;
    },

    updateWorkout(state, { workout, newState }) {
        Object.keys(newState).forEach(key => {
            workout[key] = newState[key]
        })
    },

    updateWorkoutPositionFromOrder(state, orderedWorkouts) {
        orderedWorkouts.forEach((workout, updatedPosition) => { workout.position = updatedPosition; });

        state.workoutProgramRoutines = orderedWorkouts;
    },

    updateExercisePositionFromOrder(state, { workoutUuid, newOrderedExercises }) {
        newOrderedExercises.forEach((exercise, updatedPosition) => { exercise.position = updatedPosition; });

        const workout = UuidHelper.findIn(state.workoutProgramRoutines, workoutUuid);
        workout.routineExercises = newOrderedExercises;
    },

    updateExercise(state, { exercise, newState }) {
        Object.keys(newState).forEach(key => {
            exercise[key] = newState[key]
        })
    },

    addExerciseToWorkout(state, { uuid, workoutUuid }) {
        const workout = UuidHelper.findIn(state.workoutProgramRoutines, workoutUuid);

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
        state.workoutProgramRoutines.some(workout => {
            return UuidHelper.removeFrom(workout.routineExercises, exerciseUuid);
        });
    },

    deleteWorkout(state, { workoutUuid }) {
        UuidHelper.removeFrom(state.workoutProgramRoutines, workoutUuid);
    },

    fixPositions(state) {
        state.workoutProgramRoutines.sort(sortByPosition);
        state.workoutProgramRoutines.forEach((workout, index) => {
            workout.position = index;

            workout.routineExercises.sort(sortByPosition);
            workout.routineExercises.forEach((exercise, index) => {
                exercise.position = index;
            });
        });
    },

    addWorkout(state, workout) {
        if (state.workoutProgramRoutines.length === 0) {
            state.workoutProgramRoutines.push(workout);
            return;
        }

        // Bump the positions off all routines that come after the one we are adding.
        state.workoutProgramRoutines.forEach(existingWorkout => {
            if (existingWorkout.position >= workout.position) {
                existingWorkout.position++;
            }
        });

        state.workoutProgramRoutines.splice(workout.position, 0, workout);
    },

    patchInSaveResponse(state, saveResponse) {
        // Nothing should be different from the server except the create date. And uuid if it was assigned there.
        state.uuid = saveResponse.uuid;
        state.createdAt = saveResponse.createdAt;
    },

};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
