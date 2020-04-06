import WorkoutProgramService from '../../api/WorkoutProgramService'
import ClientSideId from '../../ClientSideId'
import { debounce } from 'lodash';

const LOCAL_STORAGE_NAMESPACE = 'program-builder-state';
const BUILDER_IN_PROGRESS = 'builder-in-progress';
const SAVE_DEBOUNCE_WAIT = 2000;

function localStorageKey(key) {
    return `${LOCAL_STORAGE_NAMESPACE}_${key}`
}

function sortByPosition(a, b) {
    return a < b ? 1 : 0;
}

const state = {
    id: null,
    name: '',
    workoutProgramRoutines: [],
    justAdded: null,
};

const getters = {

    wasJustAdded: (state) => (cid) => {
        return state.justAdded === cid;
    },

    getWorkout: (state) => (cid) => {
        return ClientSideId.findIn(state.workoutProgramRoutines, cid);
    },

    getOrderedWorkouts(state) {
        return [...state.workoutProgramRoutines].sort((a, b) => {
            return a.position - b.position;
        })
    },

    getOrderedExercises: (state, getters) => (workoutCid) => {
        const workout = getters.getWorkout(workoutCid);

        return [...workout.routineExercises].sort((a, b) => {
            return a.position - b.position;
        })
    },

    getExercise: (state) => (cid) => {
        let exercise = null;

        state.workoutProgramRoutines.some(function (workout) {
            let found =  ClientSideId.findIn(workout.routineExercises, cid);

            if (found) {
                exercise = found;
                return true; // Early exit.
            }
        });

        return exercise;
    },

    isNewWorkoutInExistingProgram: (state, getters) => (cid) => {
        const workout = getters.getWorkout(cid);

        return state.id && !workout.id;
    },

    isNewExercise: (state, getters) => (cid) => {
        const exercise = getters.getExercise(cid);

        return !exercise.id
    },

};

const actions = {
    startNew({ commit }) {
        commit('reset', {
            id: null,
            name: null,
            workoutProgramRoutines: [
                {
                    name: null,
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

    updateWorkoutName({ state, commit, dispatch }, { cid, name }) {
        const workout = ClientSideId.findIn(state.workoutProgramRoutines, cid);

        commit('updateWorkout', { workout, newState: { name }  });

        dispatch('save');
    },

    updateWorkoutPositionFromOrder({ state, commit, dispatch }, orderedWorkouts) {
        commit('updateWorkoutPositionFromOrder', orderedWorkouts);

        dispatch('save');
    },

    updateExercisePositionFromOrder({ state, commit, dispatch }, { workoutCid, orderedExercises }) {
        commit('updateExercisePositionFromOrder', { workoutCid, orderedExercises });

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

        ClientSideId.assignTo(workout);

        commit('addWorkout', workout);
        commit('setJustAdded', workout.cid);

        dispatch('save');
    },

    addExerciseToWorkout({ state, commit, dispatch }, { workoutCid }) {
        const cid = ClientSideId.assign();

        commit('addExerciseToWorkout', { cid, workoutCid });
        commit('setJustAdded', cid);

        dispatch('save');
    },

    clearJustAdded({ commit }) {
        commit('setJustAdded', null);
    },

    deleteWorkout({ state, commit, dispatch }, { workoutCid }) {
        commit('deleteWorkout', { workoutCid });

        commit('fixPositions');

        dispatch('save');
    },

    deleteExercise({ state, commit, dispatch }, { exerciseCid }) {
        commit('deleteExercise', { exerciseCid });

        commit('fixPositions');

        dispatch('save')
    },

    updateExercise({ state, commit, getters, dispatch }, { exerciseCid, ...newState }) {
        const exercise = getters.getExercise(exerciseCid);

        commit('updateExercise', { exercise, newState });

        dispatch('save')
    },

    tryRestoreFromLocalStorage({ commit, dispatch }) {
        const stateFromLocalStorage = JSON.parse(localStorage.getItem(localStorageKey(BUILDER_IN_PROGRESS)));

        if (stateFromLocalStorage) {
            commit('reset', stateFromLocalStorage);
        } else {
            dispatch('startNew');
        }
    },

    save: debounce(async ({ state, commit }) => {
        localStorage.setItem(localStorageKey(BUILDER_IN_PROGRESS), JSON.stringify(state));

        try {
            const response = await WorkoutProgramService.save(state);

            commit('reset', response.data);
            localStorage.removeItem(localStorageKey(BUILDER_IN_PROGRESS));
        } catch (error) {
            console.error(error); // TODO add to toast queue/user facing error message.
        }

    }, SAVE_DEBOUNCE_WAIT),

    async fetchById({state, commit}, id) {
        const response = await WorkoutProgramService.get(id);

        commit('reset', response.data);

        return response.data;
    }
};

const mutations = {
    reset(state, newState) {
        Object.keys(newState).forEach(key => {
            state[key] = newState[key]
        });

        state.workoutProgramRoutines.forEach((workout) => {
            ClientSideId.assignTo(workout);
            ClientSideId.assignToAll(workout.routineExercises);
        });
    },

    setJustAdded(state, cid) {
        state.justAdded = cid;
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

    updateExercisePositionFromOrder(state, { workoutCid, orderedExercises }) {
        orderedExercises.forEach((exercise, updatedPosition) => { exercise.position = updatedPosition; });

        const workout = ClientSideId.findIn(state.workoutProgramRoutines, workoutCid);
        workout.routineExercises = orderedExercises;
    },

    updateExercise(state, { exercise, newState }) {
        Object.keys(newState).forEach(key => {
            exercise[key] = newState[key]
        })
    },

    addExerciseToWorkout(state, { cid, workoutCid }) {
        const workout = ClientSideId.findIn(state.workoutProgramRoutines, workoutCid);

        workout.routineExercises.push({
            cid,
            name: null,
            numberOfSets: null,
            position: workout.routineExercises.length
        });
    },

    deleteExercise(state, { exerciseCid }) {
        // Use some to early exit if the exercise was found and removed.
        state.workoutProgramRoutines.some(function (workout) {
            return ClientSideId.removeFrom(workout.routineExercises, exerciseCid);
        });
    },

    deleteWorkout(state, { workoutCid }) {
        ClientSideId.removeFrom(state.workoutProgramRoutines, workoutCid);
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
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
