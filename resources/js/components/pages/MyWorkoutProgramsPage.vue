<template>
    <div>
        <AppBar title="My workout programs" :back-to="{ name: 'HomePage' }" />
        <SessionOverviewLoadingSkeleton v-if="myWorkoutProgramsIsLoading" />
        <NoProgramsHint v-else-if="myWorkoutPrograms.length === 0" />
        <WorkoutProgramList v-else />
    </div>
</template>

<script>
import WorkoutProgramList from '../domain/WorkoutProgramList';
import NoProgramsHint from '../domain/userHints/NoProgramsHint';
import AppBar from '../AppBar';
import SessionOverviewLoadingSkeleton from '../domain/workoutSessions/SessionOverviewLoadingSkeleton.vue';
import { useProgramBuilderStore } from '../../stores/programBuilder';

export default {
    name: 'MyWorkoutProgramsPage',
    components: {
        SessionOverviewLoadingSkeleton,
        NoProgramsHint,
        AppBar,
        WorkoutProgramList,
    },
    setup() {
        const programBuilderStore = useProgramBuilderStore();
        return { programBuilderStore };
    },
    computed: {
        myWorkoutProgramsIsLoading() {
            return this.programBuilderStore.myWorkoutProgramsIsLoading;
        },
        myWorkoutPrograms() {
            return this.programBuilderStore.myWorkoutPrograms;
        },
    },
};
</script>
