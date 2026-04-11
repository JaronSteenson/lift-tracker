<template>
    <div>
        <PageAppBar :title="appName" show-drawer-icon />
        <SessionOverviewLoadingSkeleton
            v-if="isPending || workoutProgramsIsPending"
        />
        <NoProgramsWelcomeHint v-else-if="shouldShowNoProgramsWelcomeHint" />
        <NoSessionsHint v-else-if="shouldShowNoSessionsHint" />
        <MyTimeline
            v-else
            :data="data"
            :is-pending="isPending"
            :fetch-next-page="fetchNextPage"
            :has-next-page="hasNextPage"
        />
    </div>
</template>

<script>
import MyTimeline from '../domain/MyTimeline';
import NoProgramsWelcomeHint from '../domain/userHints/NoProgramsWelcomeHint';
import NoSessionsHint from '../domain/userHints/NoSessionsHint';
import PageAppBar from '../AppBar';
import SessionOverviewLoadingSkeleton from '../domain/workoutSessions/SessionOverviewLoadingSkeleton.vue';
import { useAppShell } from '../../composables/useAppShell';
import { useTimelineQuery } from '../domain/workoutSessions/composibles/workoutSessionQueries';
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
        const { appName } = useAppShell();
        const { data, isPending, fetchNextPage, hasNextPage } =
            useTimelineQuery();
        const {
            isPending: workoutProgramsIsPending,
            shouldShowNoProgramsWelcomeHint,
        } = useWorkoutProgramList();

        return {
            appName,
            data,
            isPending,
            fetchNextPage,
            hasNextPage,
            shouldShowNoProgramsWelcomeHint,
            workoutProgramsIsPending,
        };
    },
    computed: {
        shouldShowNoSessionsHint() {
            return !this.isPending && this.data?.length === 0;
        },
    },
};
</script>
