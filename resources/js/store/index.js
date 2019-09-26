import Vue from 'vue'
import Vuex from 'vuex'
import programBuilder from './modules/programBuilder'

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
    modules: {
        programBuilder
    },
    strict: debug,
})
