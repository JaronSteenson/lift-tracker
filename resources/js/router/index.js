import Vue from 'vue'
import HomePage from "../components/pages/HomePage";
import LoginPage from "../components/pages/LoginPage";
import ProgramBuilderPage from "../components/pages/ProgramBuilderPage";
import NewSessionOverviewPage from "../components/pages/NewSessionOverviewPage";
import SessionOverviewPage from "../components/pages/SessionOverviewPage";
import NotFoundPage from "../components/pages/NotFoundPage";
import VueRouter from "vue-router";
import store from './../store';
import SetOverviewPage from "../components/pages/SetOverviewPage";

Vue.use(VueRouter);

function forceLogin(to, from, next) {
    const isAuthed = store.getters['app/userIsAuthenticated'];
    const toLogin = to.name === 'login' || to.name === 'sign-up';

    if (isAuthed && toLogin) {
        next({ name: 'home' });
        return;
    }

    if (!isAuthed && !toLogin) {
        store.dispatch('app/setAfterLoginUrl', window.location.href);
        next({ name: 'login' });
        return;
    }

    next();
}

function checkPwaStart(to, from, next) {
    const isAuthed = store.getters['app/userIsAuthenticated'];
    const toPwaStart = to.fullPath === '/pwa-start';

    if (!isAuthed || !toPwaStart) {
        next();
        return;
    }

    const inProgressWorkouts = store.getters['workoutSession/inProgressWorkouts'];
    if (inProgressWorkouts === null || inProgressWorkouts.length === 0) {
        next({ name: 'home' });
        return;
    }

    const inProgressSet = store.getters['workoutSession/currentSetForInProgressWorkout'](inProgressWorkouts[0].uuid);
    next({ name: 'setOverview', params: { sessionSetUuid: inProgressSet.uuid }});
}

async function waitForAppBootstrap(to, from, next) {
    if (!store.getters['app/isBootstraped']) {
        await store.dispatch('app/fetchAppBootstrapData');
    }

    if (store.getters['app/userIsAuthenticated']) {
        await store.dispatch('workoutSession/fetchInProgressWorkouts');
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
        name: 'pwaStart',
        path: '/pwa-start',
        component: HomePage
    },
    {
        name: 'login',
        path: '/login',
        component: LoginPage,
        props: true,
    },
    {
        name: 'newProgramBuilder',
        path: '/program-builder',
        component: ProgramBuilderPage,
        props: true,
    },
    {
        name: 'programBuilder',
        path: '/program-builder/:workoutProgramUuid',
        component: ProgramBuilderPage,
        props: true
    },
    {
        name: 'newSessionOverview',
        path: '/new-session-overview/:originRoutineUuid',
        component: NewSessionOverviewPage,
        props: true
    },
    {
        name: 'sessionOverview',
        path: '/session-overview/:workoutSessionUuid',
        component: SessionOverviewPage,
        props: true
    },
    {
        name: 'setOverview',
        path: '/set-overview/:sessionSetUuid',
        component: SetOverviewPage,
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

router.beforeEach(waitForAppBootstrap);
router.beforeEach(forceLogin);
router.beforeEach(checkPwaStart);

export default router;
