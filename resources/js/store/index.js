import Vue from 'vue'
import Vuex from 'vuex'
import programBuilder from './modules/programBuilder'
import user from './modules/user'

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
    modules: {
        programBuilder,
        user,
    },
    strict: debug,
})
