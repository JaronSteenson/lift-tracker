import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../components/pages/LoginPage';
import AccountPage from '../components/pages/AccountPage';
import ProgramBuilderPage from '../components/pages/ProgramBuilderPage';
import MyWorkoutProgramsPage from '../components/pages/MyWorkoutProgramsPage';
import HomePage from '../components/pages/HomePage';
import NewSessionOverviewPage from '../components/pages/NewSessionOverviewPage';
import NewSessionRoutineSelectPage from '../components/pages/NewSessionRoutineSelectPage';
import SessionOverviewPage from '../components/pages/SessionOverviewPage';
import NotFoundPage from '../components/pages/NotFoundPage';
import CheckInEditPage from '../components/pages/CheckInEditPage';
import SetOverviewPage from '../components/pages/SetOverviewPage';
import PrivacyPolicyPage from '../components/pages/PrivacyPolicyPage';
import { useAppStore } from '../stores/app';

async function checkAuthGuards(to, from) {
    const appStore = useAppStore();

    // Wait for app to be bootstrapped before checking auth
    if (!appStore.isBootstrapped) {
        // Wait for bootstrap to complete
        let attempts = 0;
        while (!appStore.isBootstrapped && attempts < 50) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            attempts++;
        }

        // If still not bootstrapped after 5 seconds, let it proceed
        if (!appStore.isBootstrapped) {
            return true;
        }
    }

    const isAuthed = appStore.userIsAuthenticated;
    await appStore.setPreviousRoute(from);

    if (to.meta.guard === GUARD_NONE) {
        return true;
    }

    if (isAuthed && to.meta.guard === GUARD_AUTHED) {
        if (to.name === 'AuthCallback') {
            return { name: 'HomePage' };
        }
        return true;
    }

    if (isAuthed && to.meta.guard === GUARD_UNAUTHED_ONLY) {
        return { name: 'HomePage' };
    }

    if (!isAuthed && to.meta.guard === GUARD_AUTHED) {
        return { name: 'LoginPage' };
    }

    return true;
}

function checkForceDrawerHide(to) {
    const goingToForceHideRoute = [
        'ProgramBuilderPage',
        'ProgramBuilderPageNew',
    ].includes(to.name);

    const appStore = useAppStore();
    const isVisible = appStore.navigationDrawerOpen;
    appStore.setNavigationDrawerOpen(isVisible && !goingToForceHideRoute);

    return true;
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
        name: 'AuthCallback',
        path: '/callback',
        component: HomePage,
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
        name: 'CheckInEditPage',
        path: '/check-in/:workoutSessionUuid?',
        component: CheckInEditPage,
        props: true,
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
        path: '/timeline-entry/:workoutSessionUuid',
        component: SessionOverviewPage,
        props: true,
        meta: {
            guard: GUARD_AUTHED,
        },
    },
    {
        name: 'SetOverviewPage',
        path: '/set-overview/:sessionSetUuid/:fromCheckIn?',
        component: SetOverviewPage,
        props: true,
        meta: {
            guard: GUARD_AUTHED,
        },
    },
    {
        path: '/:pathMatch(.*)*',
        name: '404',
        component: NotFoundPage,
        meta: {
            guard: GUARD_NONE,
        },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        } else {
            return { left: 0, top: 0 };
        }
    },
});

router.beforeEach(checkAuthGuards);
router.beforeEach(checkForceDrawerHide);

export default router;
