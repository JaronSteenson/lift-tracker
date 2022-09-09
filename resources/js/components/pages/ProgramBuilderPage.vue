<template>
    <ProgramBuilder
        v-if="userIsAuthenticated"
        class="programBuilder"
        :workout-program-uuid="workoutProgramUuid"
    />
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
    mounted() {
        const element = document.querySelector('main');
        element.style.height = '100vh';
        element.style.overflow = 'scroll hidden';
    },
    destroyed() {
        const element = document.querySelector('main');
        element.style.height = 'unset';
        element.style.overflow = 'unset';
    },
    computed: {
        ...mapGetters('app', ['userIsAuthenticated']),
    },
};
</script>
