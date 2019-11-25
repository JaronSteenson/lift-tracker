require('bootstrap');

import Vue from 'vue';
import VueRouter from 'vue-router';
import HomePage from './components/pages/HomePage';
import Vuex from 'vuex'

import WorkoutProgramList from './components/domain/WorkoutProgramList.vue';
import WorkoutProgramPage from './components/pages/WorkoutProgramPage';
import store from './store';


Vue.use(VueRouter);
Vue.use(Vuex);

const routes = [
    { path: '/', component: HomePage },

    { path: '/workout-programs', component: WorkoutProgramList },
    { path: '/workout-programs/create', component: WorkoutProgramPage },
    { path: '/workout-programs/:workoutProgramId', component: WorkoutProgramPage },

];

const router = new VueRouter({
    routes,
    mode: 'history',
});

const app = new Vue({
    store,
    router
}).$mount('#app');
