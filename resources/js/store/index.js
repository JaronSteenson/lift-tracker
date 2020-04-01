import Vue from 'vue'
import Vuex from 'vuex'
import programBuilder from './modules/programBuilder'
import app from './modules/app'

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
    modules: {
        programBuilder,
        app,
    },
    strict: debug,
})
