import WorkoutSessionService from '../../api/WorkoutSessionService'
import UuidHelper from '../../UuidHelper'

function defaultState() {
    return {
        workoutSession: {
            uuid: null,
            name: '',
            sessionExercises: null,
        },
    }
}

const state = defaultState();

const getters = {

    uuid(state) {
        return state.workoutSession.uuid;
    },

    workoutName(state) {
        return state.workoutSession.name;
    },

    firstSet(state) {
        return state.workoutSession.sessionExercises[0].sessionSets[0]
    },

    hasSetInSession: (state) => (uuid) => {
        if (state?.workoutSession?.sessionExercises) {
            return UuidHelper.arrayIncludes(state.workoutSession.sessionExercises, uuid)
        }

        return false;
    },

    set: (state, getters) => (uuid) => {
        const exercise = getters.exerciseBySet(uuid);

        return UuidHelper.findIn(exercise.sessionSets, uuid);
    },

    exerciseBySet: (state) => (uuid) => {
        const exercises = state.workoutSession.sessionExercises;

        return exercises.find(exercise => {
            return UuidHelper.arrayIncludes(exercise.sessionSets, uuid);
        });
    },

    weightForCurrentSet: (state, getters) => (uuid) => {
        const actualSet = getters.set(uuid);

        if (actualSet.weight !== null) {
            return actualSet.weight;
        }

        const exercise = getters.exerciseBySet(uuid);

        return exercise.plannedWeight;
    },

    restPeriodForCurrentSet: (state, getters) => (uuid) => {
        const actualSet = getters.set(uuid);

        if (actualSet.restPeriodDuration !== null) {
            return actualSet.restPeriodDuration;
        }

        const exercise = getters.exerciseBySet(uuid);

        return exercise.plannedRestPeriodDuration;
    },

    repsForCurrentSet: (state, getters) => (uuid) => {
        const actualSet = getters.set(uuid);

        if (actualSet.reps !== null) {
            return actualSet.reps;
        }

        return null;
    },

};

const actions = {

    updateSetWeight({ commit }, { uuid, weight }) {
        commit('updateSet', { uuid, weight });
    },

    updateSetRestPeriodDuration({ commit }, { uuid, restPeriodDuration }) {
        commit('updateSet', { uuid, restPeriodDuration });
    },

    updateSetReps({ commit }, { uuid, reps }) {
        commit('updateSet', { uuid, reps });
    },

    updateExerciseNotes({ commit }, { uuid, notes }) {
        commit('updateExercise', { uuid, notes });
    },

    async fetch({ commit, dispatch }, uuid) {
        const response = await WorkoutSessionService.get(uuid);
        commit('reset', { workoutSession: response.data });

        return response;
    },

    async fetchBySet({ commit, dispatch }, sessionSetUuid) {
        const response = await WorkoutSessionService.getBySet(sessionSetUuid);
        commit('reset', { workoutSession: response.data });

        return response;
    },

    async startWorkout({ commit, dispatch }, { originWorkoutUuid }) {
        const response = await WorkoutSessionService.startNew(originWorkoutUuid);
        commit('reset', { workoutSession: response.data });
    },

};

const mutations = {

    reset(state, newState) {
        Object.keys(newState).forEach(key => {
            state[key] = newState[key]
        });
    },

    updateSet(state, newSetState) {
        const set = UuidHelper.findDeep(state.workoutSession.sessionExercises, newSetState.uuid);

        Object.keys(newSetState).forEach(key => {
            set[key] = newSetState[key]
        });
    },

    updateExercise(state, newExerciseState) {
        const exercise = UuidHelper.findIn(state.workoutSession.sessionExercises, newExerciseState.uuid);

        Object.keys(newExerciseState).forEach(key => {
            exercise[key] = newExerciseState[key]
        });
    },

};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
