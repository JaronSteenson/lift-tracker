<template>
    <div>
        <PageAppBar :title="appName" show-drawer-icon />
        <SessionOverviewLoadingSkeleton
            v-if="isPending || workoutProgramsIsPending"
        />
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
import { useTimelineQuery } from '../../api/WorkoutSessionService';
import { useWorkoutProgramList } from '../domain/programBuilder/composibles/programBuilderQueries';

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
        const { data, isPending } = useTimelineQuery();
        const {
            isPending: workoutProgramsIsPending,
            shouldShowNoProgramsWelcomeHint,
        } = useWorkoutProgramList();

        return {
            appStore,
            data,
            isPending,
            shouldShowNoProgramsWelcomeHint,
            workoutProgramsIsPending,
        };
    },
    computed: {
        appName() {
            return this.appStore.appName;
        },
        shouldShowNoSessionsHint() {
            return !this.isPending && this.data?.length === 0;
        },
    },
};
</script>
