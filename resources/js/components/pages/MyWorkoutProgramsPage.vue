<template>
    <div>
        <PageToolbar
            title="My workout programs"
            :back-to="{ name: 'MyWorkoutSessionsPage' }"
        />
        <NoProgramsHint v-if="myWorkoutPrograms.length === 0" />
        <ListPage v-else>
            <slot>
                <WorkoutProgramList />
            </slot>
            <template v-slot:fab>
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
            </template>
        </ListPage>
    </div>
</template>

<script>
import WorkoutProgramList from '../domain/WorkoutProgramList';
import ListPage from '../layouts/ListPage';
import { mapGetters } from 'vuex';
import NoProgramsHint from '../domain/userHints/NoProgramsHint';
import PageToolbar from '../layouts/PageAppBar';

export default {
    components: {
        NoProgramsHint,
        ListPage,
        PageToolbar,
        WorkoutProgramList,
    },
    computed: {
        ...mapGetters('programBuilder', ['myWorkoutPrograms']),
    },
};
</script>
