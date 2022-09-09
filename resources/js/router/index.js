import Vue from 'vue';
import LoginPage from '../components/pages/LoginPage';
import AccountPage from '../components/pages/AccountPage';
import ProgramBuilderPage from '../components/pages/ProgramBuilderPage';
import MyWorkoutProgramsPage from '../components/pages/MyWorkoutProgramsPage';
import HomePage from '../components/pages/HomePage';
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
    const toLogin = to.name === 'LoginPage' || to.name === 'sign-up';

    if (isAuthed && toLogin) {
        next({ name: 'HomePage' });
        return;
    }

    if (!isAuthed && !toLogin) {
        await store.dispatch('app/setAfterLoginUrl', window.location.href);
        next({ name: 'LoginPage' });
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

    const inProgressWorkouts =
        store.getters['workoutSession/inProgressWorkouts'];
    if (inProgressWorkouts === null || inProgressWorkouts.length === 0) {
        next({ name: 'HomePage' });
        return;
    }

    const inProgressSet = store.getters[
        'workoutSession/currentSetForInProgressWorkout'
    ](inProgressWorkouts[0].uuid);
    next({
        name: 'SetOverviewPage',
        params: { sessionSetUuid: inProgressSet.uuid },
    });
}

function checkForceDrawerHide(to, from, next) {
    const goingToForceHideRoute = [
        'ProgramBuilderPage',
        'ProgramBuilderPageNew',
    ].includes(to.name);

    const isVisible = store.getters['app/navigationDrawerOpen'];
    store.dispatch(
        'app/setNavigationDrawerOpen',
        isVisible && !goingToForceHideRoute
    );

    next();
}

const routes = [
    {
        name: 'HomePage',
        path: '/',
        component: HomePage,
    },
    {
        name: 'PwaStart',
        path: '/pwa-start',
    },
    {
        name: 'LoginPage',
        path: '/login',
        component: LoginPage,
        props: true,
    },
    {
        name: 'AccountPage',
        path: '/account',
        component: AccountPage,
    },
    {
        name: 'ProgramBuilderPageNew',
        path: '/program-builder',
        component: ProgramBuilderPage,
        props: true,
    },
    {
        name: 'ProgramBuilderPage',
        path: '/program-builder/:workoutProgramUuid',
        component: ProgramBuilderPage,
        props: true,
    },
    {
        name: 'MyWorkoutProgramsPage',
        path: '/workout-programs',
        component: MyWorkoutProgramsPage,
    },
    {
        name: 'NewSessionRoutineSelectPage',
        path: '/new-session',
        component: NewSessionRoutineSelectPage,
    },
    {
        name: 'NewSessionOverviewPage',
        path: '/new-session-overview/:originRoutineUuid',
        component: NewSessionOverviewPage,
        props: true,
    },
    {
        name: 'SessionOverviewPage',
        path: '/session-overview/:workoutSessionUuid',
        component: SessionOverviewPage,
        props: true,
    },
    {
        name: 'SetOverviewPage',
        path: '/set-overview/:sessionSetUuid',
        component: SetOverviewPage,
        props: true,
    },
    {
        path: '*',
        name: '404',
        component: NotFoundPage,
    },
];

const router = new VueRouter({
    routes,
    mode: 'history',
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        } else {
            return { x: 0, y: 0 };
        }
    },
});

router.beforeEach(forceLogin);
router.beforeEach(checkPwaStart);
router.beforeEach(checkForceDrawerHide);

export default router;
