import WorkoutProgramService from '../../api/WorkoutProgramService'
import UuidHelper from '../../UuidHelper'
import { debounce, pick } from 'lodash';

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
    uuid: null,
    name: '',
    workoutProgramRoutines: [],
    justAdded: null,
};

const getters = {

    wasJustAdded: (state) => (uuid) => {
        return state.justAdded === uuid;
    },

    getWorkout: (state) => (uuid) => {
        return UuidHelper.findIn(state.workoutProgramRoutines, uuid);
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

    getSavePayload(state) {
        const workoutProgramFields = [
            'uuid',
            'name',
            'workoutProgramRoutines',
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
            uuid: UuidHelper.assign(),
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

    updateWorkoutName({ state, commit, dispatch }, { uuid, name }) {
        const workout = UuidHelper.findIn(state.workoutProgramRoutines, uuid);

        commit('updateWorkout', { workout, newState: { name }  });

        dispatch('save');
    },

    updateWorkoutPositionFromOrder({ state, commit, dispatch }, orderedWorkouts) {
        commit('updateWorkoutPositionFromOrder', orderedWorkouts);

        dispatch('save');
    },

    updateExercisePositionFromOrder({ state, commit, dispatch }, { workoutUuid, orderedExercises }) {
        commit('updateExercisePositionFromOrder', { workoutUuid, orderedExercises });

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
        commit('setJustAdded', workout.uuid);

        dispatch('save');
    },

    addExerciseToWorkout({ state, commit, dispatch }, { workoutUuid }) {
        const uuid = UuidHelper.assign();

        commit('addExerciseToWorkout', { uuid, workoutUuid });
        commit('setJustAdded', uuid);

        dispatch('save');
    },

    clearJustAdded({ commit }) {
        commit('setJustAdded', null);
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

    tryRestoreFromLocalStorage({ commit, dispatch }) {
        const stateFromLocalStorage = JSON.parse(localStorage.getItem(localStorageKey(BUILDER_IN_PROGRESS)));

        if (stateFromLocalStorage) {
            commit('reset', stateFromLocalStorage);
        } else {
            dispatch('startNew');
        }
    },

    save: debounce(async ({ state, commit, getters }) => {
        localStorage.setItem(localStorageKey(BUILDER_IN_PROGRESS), JSON.stringify(state));

        try {
            const savePayload = getters.getSavePayload();

            debugger;

            const response = await WorkoutProgramService.save(savePayload);

            commit('reset', response.data);
            localStorage.removeItem(localStorageKey(BUILDER_IN_PROGRESS));
        } catch (error) {
            console.error(error); // TODO add to toast queue/user facing error message.
        }

    }, SAVE_DEBOUNCE_WAIT),

    async fetch({ commit }, uuid) {
        const response = await WorkoutProgramService.get(uuid);

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
            UuidHelper.assignTo(workout);
            UuidHelper.assignToAll(workout.routineExercises);
        });
    },

    setJustAdded(state, uuid) {
        state.justAdded = uuid;
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

    updateExercisePositionFromOrder(state, { workoutUuid, orderedExercises }) {
        orderedExercises.forEach((exercise, updatedPosition) => { exercise.position = updatedPosition; });

        const workout = UuidHelper.findIn(state.workoutProgramRoutines, workoutUuid);
        workout.routineExercises = orderedExercises;
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
            numberOfSets: null,
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
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
