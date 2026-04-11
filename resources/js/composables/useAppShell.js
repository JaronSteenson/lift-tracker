import { computed, reactive, toRefs } from 'vue';

const appShellState = reactive({
    appName: 'Lift Tracker',
    previousRoute: '/',
    navigationDrawerOpen: false,
});

export function getAppShellState() {
    return appShellState;
}

export function setPreviousRoute(previousRoute) {
    appShellState.previousRoute = previousRoute;
}

export function setNavigationDrawerOpen(navigationDrawerOpen) {
    appShellState.navigationDrawerOpen = navigationDrawerOpen;
}

export function useAppShell() {
    const { appName, previousRoute, navigationDrawerOpen } =
        toRefs(appShellState);

    return {
        appName: computed(() => appName.value),
        previousRoute: computed(() => previousRoute.value),
        navigationDrawerOpen: computed(() => navigationDrawerOpen.value),
        setPreviousRoute,
        setNavigationDrawerOpen,
    };
}
