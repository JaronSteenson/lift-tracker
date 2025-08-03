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
import { mapGetters, mapState } from 'vuex';
import NoProgramsHint from '../domain/userHints/NoProgramsHint';
import AppBar from '../AppBar';
import SessionOverviewLoadingSkeleton from '../domain/workoutSessions/SessionOverviewLoadingSkeleton.vue';

export default {
    components: {
        SessionOverviewLoadingSkeleton,
        NoProgramsHint,
        AppBar,
        WorkoutProgramList,
    },
    computed: {
        ...mapState('programBuilder', ['myWorkoutProgramsIsLoading']),
        ...mapGetters('programBuilder', ['myWorkoutPrograms']),
    },
};
</script>
