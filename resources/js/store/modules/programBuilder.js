import WorkoutProgramService from '../../api/WorkoutProgramService'
import ClientSideId from '../../ClientSideId'

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

    updateName({state, commit}, name) {
        commit('updateName', name);
    },

    updateWorkoutName({ state, commit }, { cid, name }) {
        const workout = ClientSideId.findIn(state.workoutProgramRoutines, cid);

        commit('updateWorkout', { workout, newState: { name }  });
    },

    deleteWorkout({ state, commit }, { cid }) {
        const workoutToDelete = ClientSideId.findIn(state.workoutProgramRoutines, cid);

        commit('deleteWorkout', workoutToDelete.position);
    },

    addWorkoutToProgram({ state, commit }, workout) {
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
    },

    addExerciseToWorkout({ state, commit }, { workoutCid }) {
        commit('addExerciseToWorkout', { workoutCid })
    },

    removeExercise({ state, commit }, { exerciseCid }) {
        commit('removeExercise', { exerciseCid })
    },

    updateExercise({ state, commit, getters }, { exerciseCid, ...newState }) {
        const exercise = getters.getExercise(exerciseCid);

        commit('updateExercise', { exercise, newState });
    },

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
