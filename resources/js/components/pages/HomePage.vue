<template>
    <div>
        <PageAppBar :title="appName" show-drawer-icon />
        <SessionOverviewLoadingSkeleton v-if="isInitialLoading" />
        <NoProgramsWelcomeHint v-else-if="shouldShowNoProgramsWelcomeHint" />
        <NoSessionsHint v-else-if="shouldShowNoSessionsHint" />
        <MyTimeline v-else />
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
import { useTimelineQuery } from '../../api/WorkoutSessionService';

export default {
    name: 'HomePage',
    components: {
        PageAppBar,
        SessionOverviewLoadingSkeleton,
        NoSessionsHint,
        NoProgramsWelcomeHint,
        MyTimeline,
    },
    setup() {
        const appStore = useAppStore();
        const workoutSessionStore = useWorkoutSessionStore();

        const { data: workoutSessions, isPending: workoutSessionsIsPending } =
            useTimelineQuery(workoutSessionStore.currentPageIndex);

        return {
            appStore,
            workoutSessionStore,
            workoutSessions,
            workoutSessionsIsPending,
        };
    },
    computed: {
        appName() {
            return this.appStore.appName;
        },
        myWorkoutSessionsIsLoading() {
            return this.workoutSessionsIsPending;
        },
        isInitialLoading() {
            return this.workoutSessionsIsPending;
        },
        shouldShowNoProgramsWelcomeHint() {
            return this.appStore.shouldShowNoProgramsWelcomeHint;
        },
        shouldShowNoSessionsHint() {
            return (
                !this.workoutSessionsIsPending &&
                this.workoutSessions.length === 0
            );
        },
        inProgressSet() {
            // TODO: Implement in workoutSession store
            return null;
        },
    },
};
</script>
