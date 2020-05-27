import WorkoutSessionService from '../../api/WorkoutSessionService'
import UuidHelper from '../../UuidHelper'
import { debounce, pick } from 'lodash';

function defaultState() {
    return {
        originRoutineUuid: null,
        name: '',
        sessionExercises: null,
        saveStatus: null,
        updateSaveStatusTimeout: null,
        justAddedModelUuid: null,
        createdAt: null,
        updatedAt: null,
    }
}

const state = defaultState();

const getters = {

    uuid(state) {
        debugger
        return state.uuid;
    },

    firstSet(state) {
        debugger
        return state.sessionExercises[0].sessionSets[0]
    }

};

const actions = {

    async fetch({ commit, dispatch }, uuid) {
        const response = await WorkoutSessionService.get(uuid);
        commit('reset', response.data);
    },

    async startWorkout({ commit, dispatch }, { originWorkoutUuid }) {
        const response = await WorkoutSessionService.startNew(originWorkoutUuid);
        commit('reset', response.data);
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
