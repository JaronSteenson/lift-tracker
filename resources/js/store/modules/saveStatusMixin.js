export const STATUS_SAVE_OK = 'ok';
export const STATUS_SAVE_IN_PROGRESS = 'in_progress';
export const STATUS_SAVE_ERROR = 'error';

export const state = {
    saveStatus: STATUS_SAVE_OK,
};

export const mutations = {
    updateSaveStatus(state, saveStatus) {
        state.saveStatus = saveStatus;
    },
};

export const actions = {
    startSaving({ commit }) {
        commit('updateSaveStatus', STATUS_SAVE_IN_PROGRESS);
    },

    finishSaving({ commit }) {
        commit('updateSaveStatus', STATUS_SAVE_OK);
    },

    finishSavingError({ commit }) {
        commit('updateSaveStatus', STATUS_SAVE_ERROR);
    },
};
