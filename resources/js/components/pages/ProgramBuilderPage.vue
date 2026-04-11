<template>
    <ProgramBuilder
        v-if="userIsAuthenticated"
        class="programBuilder pa-4"
        :workout-program-uuid="workoutProgramUuid"
    />
</template>

<script>
import ProgramBuilder from '../domain/programBuilder/ProgramBuilder';
import { useAuth } from '../domain/auth/composables/useAuth';

export default {
    name: 'ProgramBuilderPage',
    components: {
        ProgramBuilder,
    },
    props: {
        workoutProgramUuid: {
            type: String,
            required: false,
        },
    },
    setup() {
        const { userIsAuthenticated } = useAuth();
        return { userIsAuthenticated };
    },
    mounted() {
        const element = document.querySelector('main');
        element.style.height = '100vh';
        element.style.overflow = 'scroll hidden';
    },
    unmounted() {
        const element = document.querySelector('main');
        element.style.height = 'unset';
        element.style.overflow = 'unset';
    },
};
</script>
