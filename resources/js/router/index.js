import Vue from 'vue'
import HomePage from "../components/pages/HomePage";
import LoginPage from "../components/pages/LoginPage";
import ProgramBuilderPage from "../components/pages/ProgramBuilderPage";
import NotFoundPage from "../components/pages/NotFoundPage";
import VueRouter from "vue-router";
import store from './../store';

Vue.use(VueRouter);

function forceLogin(to, from, next) {
    const isAuthed = store.getters['app/userIsAuthenticated'];
    const toLogin = to.name === 'login';

    if (isAuthed && toLogin) {
        next({ name: 'home' });
        return;
    }

    if (!isAuthed && !toLogin) {
        store.dispatch('app/setAfterLoginRoute', to);
        next({ name: 'login' });
        return;
    }

    next();
}

async function waitForAppBoostrap(to, from, next) {
    if (!store.getters['app/isBootstraped']) {
        await store.dispatch('app/fetchAppBootstrapData');
    }

    next();
}

const routes = [
    {
        name: 'home',
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
        path: '/program-builder/new',
        component: ProgramBuilderPage,
        props: true
    },
    {
        name: 'programBuilder',
        path: '/program-builder/:workoutProgramUuid',
        component: ProgramBuilderPage,
        props: true
    },
    {
        path: '*',
        name: '404',
        component: NotFoundPage,
    }
];

const router =  new VueRouter({
    routes,
    mode: 'history',
});

router.beforeEach(waitForAppBoostrap);
router.beforeEach(forceLogin);

export default router;
