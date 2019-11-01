import WorkoutProgramService from '../../api/WorkoutProgramService'
import ClientSideId from '../../ClientSideId'

// initial state
const state = {
    id: null,
    name: '',
    workoutProgramRoutines: [],
};


// "workoutProgramRoutines":[
//     {"id":"0168c727-8fdf-40c9-ac62-d20c65be8b1b","name":"day one","normalDay":"Monday","workoutProgramId":"a9b640bc-04ae-476b-bfb6-e25746791b1d","routineExercises":
//             [{"id":"56e5e6c1-84db-46ea-92fd-14b8023ef03d","name":"BB bench press","numberOfSets":3,"workoutProgramRoutineId":"0168c727-8fdf-40c9-ac62-d20c65be8b1b"}
//             ]}

const getters = {
    getWorkout: (state) => (cid) => {
        return ClientSideId.findIn(state.workoutProgramRoutines, cid);
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

    addExerciseToWorkout(state, { workoutCid }) {
        const workout = ClientSideId.findIn(state.workoutProgramRoutines, workoutCid);

        workout.routineExercises.push({
            cid: ClientSideId.assign(),
            name: null,
            numberOfSets: null,
        })
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
