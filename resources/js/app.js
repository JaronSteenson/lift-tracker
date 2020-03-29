import Vue from 'vue';
import VueRouter from 'vue-router';
import HomePage from './components/pages/HomePage';
import Vuex from 'vuex'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'

import WorkoutProgramList from './components/domain/WorkoutProgramList.vue';
import WorkoutProgramPage from './components/pages/WorkoutProgramPage';
import store from './store';


Vue.use(VueRouter);
Vue.use(Vuex);
Vue.use(Vuetify);

const routes = [
    { path: '/', component: HomePage },

    { path: '/workout-programs', component: WorkoutProgramList },
    {
        name: 'newProgramBuilder',
        path: '/program-builder',
        component: WorkoutProgramPage,
        props: true
    },
    {
        name: 'programBuilder',
        path: '/program-builder/:workoutProgramId',
        component: WorkoutProgramPage,
        props: true
    },

];

const router = new VueRouter({
    routes,
    mode: 'history',
});

const vuetify = new Vuetify();

const app = new Vue({
    store,
    router,
    vuetify,
}).$mount('#app');
