import WorkoutProgramService from '../../api/WorkoutProgramService'

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
    getExercisesInRoutine: (state) => (routinePosition) => {
        const routine = state.workoutProgramRoutines.find(routine => routine.position === routinePosition);

        return routine.routineExercises || [];
    }
};

const actions = {
    addWorkoutToProgram({state, commit}, workout, position) {
        commit('addWorkout', workout, position);
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
    addWorkout(state, workout, position) {
        workout.position = position;

        if (state.workoutProgramRoutines.length === 0) {
            state.workoutProgramRoutines.push(workout);
            return;
        }

        // Bump the positions off all routines that come after the one we are adding.
        state.workoutProgramRoutines.forEach(routine => {
            if (routine.position >= position) {
                routine.position++;
            }
        });

        state.workoutProgramRoutines.splice(position, 0, workout);
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
