import WorkoutProgramService from '../../api/WorkoutProgramService'
import ClientSideId from '../../ClientSideId'
import { debounce } from 'lodash';

const LOCAL_STORAGE_KEY = 'program-builder-state';
const SAVE_DEBOUNCE_WAIT = 2000;

// initial state
const state = {
    id: null,
    name: '',
    workoutProgramRoutines: [],
};

const getters = {

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
};

const actions = {
    startNew({state, commit}) {
        commit('reset', {
            id: null,
            name: null,
            workoutProgramRoutines: [
                {
                    cid: ClientSideId.assign(),
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

    deleteWorkout({ state, commit, dispatch }, { cid }) {
        const workoutToDelete = ClientSideId.findIn(state.workoutProgramRoutines, cid);

        commit('deleteWorkout', workoutToDelete.position);

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

        dispatch('save');
    },

    addExerciseToWorkout({ state, commit, dispatch }, { workoutCid }) {
        commit('addExerciseToWorkout', { workoutCid })

        dispatch('save');
    },

    removeExercise({ state, commit, dispatch }, { exerciseCid }) {
        commit('removeExercise', { exerciseCid })

        dispatch('save')
    },

    updateExercise({ state, commit, getters, dispatch }, { exerciseCid, ...newState }) {
        const exercise = getters.getExercise(exerciseCid);

        commit('updateExercise', { exercise, newState });

        dispatch('save')
    },

    tryRestoreFromLocalStorage({ commit, dispatch }) {
        const stateFromLocalStorage = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));

        if (stateFromLocalStorage) {
            commit('reset', stateFromLocalStorage);
        } else {
            dispatch('startNew');
        }
    },

    save: debounce(({ state, commit, dispatch }) => {
        console.log('saving program builder state');

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));

        // TODO actual ajax if online etc.
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
        })
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
        debugger;

        orderedExercises.forEach((workout, updatedPosition) => { workout.position = updatedPosition; });

        const workout = ClientSideId.findIn(state.workoutProgramRoutines, workoutCid);
        workout.routineExercises = orderedExercises;
    },

    updateExercise(state, { exercise, newState }) {
        Object.keys(newState).forEach(key => {
            exercise[key] = newState[key]
        })
    },

    addExerciseToWorkout(state, { workoutCid }) {
        const workout = ClientSideId.findIn(state.workoutProgramRoutines, workoutCid);

        workout.routineExercises.push({
            cid: ClientSideId.assign(),
            name: null,
            numberOfSets: null,
        })
    },

    removeExercise(state, { exerciseCid }) {
        // Use some to early exit if the exercise was found and removed.
        state.workoutProgramRoutines.some(function (workout) {
            return ClientSideId.removeFrom(workout.routineExercises, exerciseCid);
        });
    },

    deleteWorkout(state, position) {
        state.workoutProgramRoutines.splice(position, 1);

        state.workoutProgramRoutines.forEach((routine) => {
            if (routine.position > position) {
                --routine.position;
            }
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
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
