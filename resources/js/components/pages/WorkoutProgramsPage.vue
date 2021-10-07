<template>
    <NoProgramsHint v-if="myWorkoutPrograms.length === 0"/>
    <ListPage v-else title="My workout programs">
        <slot>
            <WorkoutProgramList/>
        </slot>
        <template v-slot:fab>
            <VBtn
                :to="{ name: 'newProgramBuilder' }"
                fab
                fixed
                right
                bottom
            >
                <VIcon color="primary">{{ $svgIcons.mdiPlus }}</VIcon>
            </VBtn>
        </template>
    </ListPage>
</template>

<script>
import WorkoutProgramList from '../domain/WorkoutProgramList';
import ListPage from '../layouts/ListPage';
import {mapGetters} from "vuex";
import NoProgramsHint from "../domain/userHints/NoProgramsHint";

export default {
    components: {
        NoProgramsHint,
        ListPage,
        WorkoutProgramList,
    },
    computed: {
        ...mapGetters('programBuilder', ['myWorkoutPrograms']),
    },
}
</script>
