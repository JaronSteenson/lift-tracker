<template>
    <div>
        <PageToolbar
            title="My workout programs"
            :back-to="{ name: 'HomePage' }"
        />
        <NoProgramsHint v-if="myWorkoutPrograms.length === 0" />
        <WorkoutProgramList v-else />
        <VBtn
            :to="{ name: 'ProgramBuilderPageNew' }"
            fab
            fixed
            right
            bottom
            title="Build new workout program"
        >
            <VIcon color="primary">{{ $svgIcons.mdiPlus }}</VIcon>
        </VBtn>
    </div>
</template>

<script>
import WorkoutProgramList from '../domain/WorkoutProgramList';
import { mapGetters } from 'vuex';
import NoProgramsHint from '../domain/userHints/NoProgramsHint';
import PageToolbar from '../AppBar';

export default {
    components: {
        NoProgramsHint,
        PageToolbar,
        WorkoutProgramList,
    },
    computed: {
        ...mapGetters('programBuilder', ['myWorkoutPrograms']),
    },
};
</script>
