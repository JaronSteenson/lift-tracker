<template>
    <ProgramBuilder
        v-if="userIsAuthenticated"
        :workoutProgramUuid="workoutProgramUuid"
    ></ProgramBuilder>
</template>

<script>
import ProgramBuilder from '../domain/programBuilder/ProgramBuilder';
import { mapGetters } from 'vuex';

export default {
    components: {
        ProgramBuilder,
    },
    props: {
        workoutProgramUuid: {
            type: String,
            required: false,
        },
    },
    computed: {
        ...mapGetters('app', ['userIsAuthenticated']),
    },
};
</script>
