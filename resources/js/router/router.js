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
import ResetPasswordPage from '../components/pages/ResetPasswordPage';
import ResetPasswordConfirmPage from '../components/pages/ResetPasswordConfirmPage';
import PrivacyPolicyPage from '../components/pages/PrivacyPolicyPage';

Vue.use(VueRouter);

async function checkAuthGuards(to, from, next) {
    const isAuthed = store.getters['app/userIsAuthenticated'];
    await store.dispatch('app/setPreviousRoute', from);

    if (to.meta.guard === GUARD_NONE) {
        next();
        return;
    }

    if (isAuthed && to.meta.guard === GUARD_AUTHED) {
        next();
        return;
    }

    if (isAuthed && to.meta.guard === GUARD_UNAUTHED_ONLY) {
        next({ name: 'HomePage' });
        return;
    }

    if (!isAuthed && to.meta.guard === GUARD_AUTHED) {
        await store.dispatch('app/setAfterLoginUrl', window.location.pathname);
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

// The default is only authed.
const GUARD_AUTHED = Symbol('GUARD_AUTHED');
const GUARD_UNAUTHED_ONLY = Symbol('GUARD_UNAUTHED_ONLY');
const GUARD_NONE = Symbol('GUARD_NONE');

const routes = [
    {
        name: 'HomePage',
        path: '/',
        component: HomePage,
        meta: {
            guard: GUARD_AUTHED,
        },
    },
    {
        name: 'PwaStart',
        path: '/pwa-start',
        meta: {
            guard: GUARD_AUTHED,
        },
    },
    {
        name: 'LoginPage',
        path: '/login',
        component: LoginPage,
        props: true,
        meta: {
            guard: GUARD_UNAUTHED_ONLY,
        },
    },
    {
        name: 'PrivacyPolicy',
        path: '/privacy-policy',
        component: PrivacyPolicyPage,
        meta: {
            guard: GUARD_NONE,
        },
    },
    {
        name: 'ResetPasswordPage',
        path: '/reset-password',
        component: ResetPasswordPage,
        meta: {
            guard: GUARD_NONE,
        },
    },
    {
        name: 'ResetPasswordNewPasswordPage',
        path: '/reset-password-confirm',
        component: ResetPasswordConfirmPage,
        meta: {
            guard: GUARD_NONE,
        },
    },
    {
        name: 'AccountPage',
        path: '/account',
        component: AccountPage,
        meta: {
            guard: GUARD_AUTHED,
        },
    },
    {
        name: 'ProgramBuilderPageNew',
        path: '/program-builder',
        component: ProgramBuilderPage,
        props: true,
        meta: {
            guard: GUARD_AUTHED,
        },
    },
    {
        name: 'ProgramBuilderPage',
        path: '/program-builder/:workoutProgramUuid',
        component: ProgramBuilderPage,
        props: true,
        meta: {
            guard: GUARD_AUTHED,
        },
    },
    {
        name: 'MyWorkoutProgramsPage',
        path: '/workout-programs',
        component: MyWorkoutProgramsPage,
        meta: {
            guard: GUARD_AUTHED,
        },
    },
    {
        name: 'NewSessionRoutineSelectPage',
        path: '/new-session',
        component: NewSessionRoutineSelectPage,
        meta: {
            guard: GUARD_AUTHED,
        },
    },
    {
        name: 'NewSessionOverviewPage',
        path: '/new-session-overview/:originRoutineUuid',
        component: NewSessionOverviewPage,
        props: true,
        meta: {
            guard: GUARD_AUTHED,
        },
    },
    {
        name: 'SessionOverviewPage',
        path: '/session-overview/:workoutSessionUuid',
        component: SessionOverviewPage,
        props: true,
        meta: {
            guard: GUARD_AUTHED,
        },
    },
    {
        name: 'SetOverviewPage',
        path: '/set-overview/:sessionSetUuid',
        component: SetOverviewPage,
        props: true,
        meta: {
            guard: GUARD_AUTHED,
        },
    },
    {
        path: '*',
        name: '404',
        component: NotFoundPage,
        meta: {
            guard: GUARD_NONE,
        },
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

router.beforeEach(checkPwaStart);
router.beforeEach(checkAuthGuards);
router.beforeEach(checkForceDrawerHide);

export default router;
