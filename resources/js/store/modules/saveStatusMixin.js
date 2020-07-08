export const STATUS_SAVING = Symbol('saving');
export const STATUS_SAVE_SUCCESS = Symbol('save_success');
export const STATUS_SAVE_ERROR = Symbol('save_error');

export const state = {
    saveStatus: null,
    updateSaveStatusTimeout: null,
}

export function saveStatusMessageGetter(domainModel) {
    return (state) => {
        switch (state.saveStatus) {
            case STATUS_SAVE_ERROR: return `Error saving ${domainModel}`;
            case STATUS_SAVE_SUCCESS: return `${domainModel} saved`;
            case STATUS_SAVING: return 'Saving...';
        }

        return null
    };
};

export const mutations = {
    updateSaveStatusTimeout(state, saveStatusTimeout) {
        if (state.updateSaveStatusTimeout !== null) {
            clearTimeout(state.updateSaveStatusTimeout);
        }

        state.updateSaveStatusTimeout = saveStatusTimeout;
    },

    updateSaveStatus(state, saveStatus) {
        state.saveStatus = saveStatus;
    },
};

export const actions = {
    updateSaveStatus(state, saveStatus) {
        state.saveStatus = saveStatus;
    },

    startSaving({commit}) {
        commit('updateSaveStatusTimeout', null);
        commit('updateSaveStatus', STATUS_SAVING);
    },

    finishSaving({commit}) {
        commit('updateSaveStatus', STATUS_SAVE_SUCCESS);
        commit('updateSaveStatusTimeout', setTimeout(() => {
            commit('updateSaveStatus', null);
        }, 3 * 1000));
    },

    finishSavingError({commit}) {
        commit('updateSaveStatus', STATUS_SAVE_ERROR);
    },
};
