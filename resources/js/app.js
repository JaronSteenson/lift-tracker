require('bootstrap');

import Vue from 'vue';
import VueRouter from 'vue-router';
import HomePage from './components/pages/HomePage';

import WorkoutProgramList from './components/domain/WorkoutProgramList.vue';
import WorkoutProgramPage from './components/pages/WorkoutProgramPage';


Vue.use(VueRouter);

const routes = [
    { path: '/', component: HomePage },

    { path: '/workout-programs', component: WorkoutProgramList },
    { path: '/workout-programs/create', component: WorkoutProgramPage },
    { path: '/workout-programs/:id', component: WorkoutProgramPage },

];

const router = new VueRouter({
    routes,
    mode: 'history',
});

const app = new Vue({
    router
}).$mount('#app');
