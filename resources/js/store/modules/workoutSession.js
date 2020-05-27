import WorkoutSessionService from '../../api/WorkoutSessionService'
import UuidHelper from '../../UuidHelper'
import { debounce, pick } from 'lodash';

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
    }

};

const actions = {

    async fetch({ commit, dispatch }, uuid) {
        const response = await WorkoutSessionService.get(uuid);
        commit('reset', { workoutSession: response.data });
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

};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
