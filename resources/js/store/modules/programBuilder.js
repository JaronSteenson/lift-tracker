import WorkoutProgramService from '../../api/WorkoutProgramService'

const find = {
    byPosition: (collection, position) => {
        return collection.find(routine => routine.position === position);
    },
};

// initial state
const state = {
    id: null,
    name: '',
    workoutProgramRoutines: [],
};


//
// "workoutProgramRoutines":[
//     {"id":"0168c727-8fdf-40c9-ac62-d20c65be8b1b","name":"day one","normalDay":"Monday","workoutProgramId":"a9b640bc-04ae-476b-bfb6-e25746791b1d","routineExercises":
//             [{"id":"56e5e6c1-84db-46ea-92fd-14b8023ef03d","name":"BB bench press","numberOfSets":3,"workoutProgramRoutineId":"0168c727-8fdf-40c9-ac62-d20c65be8b1b"}
//             ]}

const getters = {
    getRoutineByPosition: (state) => (position) => {
        return find.byPosition(state.workoutProgramRoutines, position);
    },
    getExercisesInRoutine: (state) => (position) => {
        const routine = state.getRoutineByPosition(position);

        return routine.routineExercises || [];
    }
};

const actions = {
    startNew({state, commit}) {
        commit('reset', {
            id: null,
            name: null,
            workoutProgramRoutines: [
                {
                    name: null,
                    position: 0,
                }
            ],
        });
    },
    updateName({state, commit}, name) {
        commit('updateName', name);
    },
    updateRoutineName({ state, commit }, { position, name }) {
        const routine = find.byPosition(state.workoutProgramRoutines, position);

        commit('updateRoutine', { routine, newState: { name }  });
    },
    addWorkoutToProgram({ state, commit }, workout) {
        if (!workout) {
            workout = { name: null };
        }

        if (!workout.position) {
            workout.position = state.workoutProgramRoutines.length;
        }

        commit('addWorkout', workout);
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
    updateRoutine(state, { routine, newState }) {
        Object.keys(newState).forEach(key => {
            routine[key] = newState[key]
        })
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
