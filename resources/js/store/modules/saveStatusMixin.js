startSaving({ commit }) {
    commit('updateSaveStatusTimeout', null);
    commit('updateSaveStatus', STATUS_SAVING);
},

finishSaving({ commit }) {
    commit('updateSaveStatus', STATUS_SAVE_SUCCESS);
    commit('updateSaveStatusTimeout', setTimeout(() => {
        commit('updateSaveStatus', null);
    }, 3 * 1000));
},

finishSavingError({ commit }) {
    commit('updateSaveStatus', STATUS_SAVE_ERROR);
},
