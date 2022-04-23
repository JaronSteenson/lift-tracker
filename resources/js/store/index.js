import Vue from 'vue';
import Vuex from 'vuex';
import app from './modules/app';
import programBuilder from './modules/programBuilder';
import workoutSession from './modules/workoutSession';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
    modules: {
        app,
        programBuilder,
        workoutSession,
    },
    strict: debug,
});
