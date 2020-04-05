import Vue from 'vue';
import VueRouter from 'vue-router';
import Vuex from 'vuex'

import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'

import App from './components/App.vue';
import HomePage from './components/pages/HomePage';
import LoginPage from './components/pages/LoginPage.vue';
import WorkoutProgramList from './components/domain/WorkoutProgramList.vue';
import WorkoutProgramPage from './components/pages/WorkoutProgramPage';
import store from './store';

Vue.use(VueRouter);
Vue.use(Vuex);
Vue.use(Vuetify);

const routes = [
    {
        path: '/',
        component: HomePage
    },
    {
        name: 'login',
        path: '/login',
        component: LoginPage,
    },
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

const forceLogin = (to, from, next) => {
    // debugger //userIsAuthenticated
    // if (store.state.user.loggedIn) {
        next();
    // } else {
    //     next('/login');
    // }
};

router.beforeEach(forceLogin);

const vuetify = new Vuetify();

new Vue({
    store,
    router,
    vuetify,
    render: h => h(App),
}).$mount('#app');
