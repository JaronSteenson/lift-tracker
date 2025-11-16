<template>
    <div>
        <AppBar title="My workout programs" :back-to="{ name: 'HomePage' }" />
        <SessionOverviewLoadingSkeleton v-if="isPending" />
        <NoProgramsHint v-else-if="data?.length === 0" />
        <WorkoutProgramList v-else />
    </div>
</template>

<script>
import WorkoutProgramList from '../domain/WorkoutProgramList';
import NoProgramsHint from '../domain/userHints/NoProgramsHint';
import AppBar from '../AppBar';
import SessionOverviewLoadingSkeleton from '../domain/workoutSessions/SessionOverviewLoadingSkeleton.vue';
import { useWorkoutProgramList } from '../domain/programBuilder/composibles/programBuilderQueries';

export default {
    name: 'MyWorkoutProgramsPage',
    components: {
        SessionOverviewLoadingSkeleton,
        NoProgramsHint,
        AppBar,
        WorkoutProgramList,
    },
    setup() {
        const { data, isPending } = useWorkoutProgramList();
        return { data, isPending };
    },
};
</script>
