import Vue from 'vue'
import LoginPage from '../components/pages/LoginPage';
import SettingsPage from '../components/pages/SettingsPage';
import ProgramBuilderPage from '../components/pages/ProgramBuilderPage';
import WorkoutProgramsPage from '../components/pages/WorkoutProgramsPage';
import WorkoutSessionsPage from '../components/pages/WorkoutSessionsPage';
import NewSessionOverviewPage from '../components/pages/NewSessionOverviewPage';
import NewSessionRoutineSelectPage from '../components/pages/NewSessionRoutineSelectPage';
import SessionOverviewPage from '../components/pages/SessionOverviewPage';
import NotFoundPage from '../components/pages/NotFoundPage';
import VueRouter from 'vue-router';
import store from './../store';
import SetOverviewPage from '../components/pages/SetOverviewPage';

Vue.use(VueRouter);

async function forceLogin(to, from, next) {
    const isAuthed = store.getters['app/userIsAuthenticated'];
    const toLogin = to.name === 'login' || to.name === 'sign-up';

    if (isAuthed && toLogin) {
        next({ name: 'home' });
        return;
    }

    if (!isAuthed && !toLogin) {
        await store.dispatch('app/setAfterLoginUrl', window.location.href);
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

const routes = [
    {
        name: 'home',
        path: '/',
        redirect: '/workout-sessions',
    },
    {
        name: 'pwaStart',
        path: '/pwa-start',
    },
    {
        name: 'login',
        path: '/login',
        component: LoginPage,
        props: true,
    },
    {
        name: 'settings',
        path: '/settings',
        component: SettingsPage,
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
        name: 'programList',
        path: '/workout-programs',
        component: WorkoutProgramsPage,
    },
    {
        name: 'sessionList',
        path: '/workout-sessions',
        component: WorkoutSessionsPage,
    },
    {
        name: 'newSessionRoutineSelect',
        path: '/new-session',
        component: NewSessionRoutineSelectPage,
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

router.beforeEach(forceLogin);
router.beforeEach(checkPwaStart);

export default router;
