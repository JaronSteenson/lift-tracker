<template>
    <div>
        <PageAppBar :title="appName" show-drawer-icon />
        <SessionOverviewLoadingSkeleton v-if="isInitialLoading" />
        <NoProgramsWelcomeHint v-else-if="shouldShowNoProgramsWelcomeHint" />
        <NoSessionsHint v-else-if="shouldShowNoSessionsHint" />
        <MyTimeline v-else />
        <ResumeWorkoutFab />
    </div>
</template>

<script>
import MyTimeline from '../domain/MyTimeline';
import NoProgramsWelcomeHint from '../domain/userHints/NoProgramsWelcomeHint';
import NoSessionsHint from '../domain/userHints/NoSessionsHint';
import PageAppBar from '../AppBar';
import SessionOverviewLoadingSkeleton from '../domain/workoutSessions/SessionOverviewLoadingSkeleton.vue';
import { useAppStore } from '../../stores/app';
import { useWorkoutSessionStore } from '../../stores/workoutSession';
import ResumeWorkoutFab from '../ResumeWorkoutFab';

export default {
    name: 'HomePage',
    components: {
        PageAppBar,
        SessionOverviewLoadingSkeleton,
        NoSessionsHint,
        NoProgramsWelcomeHint,
        MyTimeline,
        ResumeWorkoutFab,
    },
    setup() {
        const appStore = useAppStore();
        const workoutSessionStore = useWorkoutSessionStore();

        return {
            appStore,
            workoutSessionStore,
        };
    },
    computed: {
        appName() {
            return this.appStore.appName;
        },
        myWorkoutSessionsIsLoading() {
            return this.workoutSessionStore.myWorkoutSessionsIsLoading;
        },
        isInitialLoading() {
            return (
                this.workoutSessionStore.myWorkoutSessionsIsLoading &&
                this.workoutSessionStore.myWorkoutSessions.length === 0
            );
        },
        shouldShowNoProgramsWelcomeHint() {
            return this.appStore.shouldShowNoProgramsWelcomeHint;
        },
        shouldShowNoSessionsHint() {
            return this.appStore.shouldShowNoSessionsHint;
        },
        inProgressSet() {
            // TODO: Implement in workoutSession store
            return null;
        },
    },
};
</script>
