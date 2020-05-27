import WorkoutSessionService from '../../api/WorkoutSessionService'
import UuidHelper from '../../UuidHelper'
import { debounce, pick } from 'lodash';

function defaultState() {
    return {
        originRoutineUuid: null,
        name: '',
        routineExercises: null,
        saveStatus: null,
        updateSaveStatusTimeout: null,
        justAddedModelUuid: null,
        createdAt: null,
        updatedAt: null,
    }
}

const state = defaultState();

const getters = {

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


};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
