<template>
    <ProgramBuilder
        v-if="userIsAuthenticated"
        class="programBuilder pa-4"
        :workout-program-uuid="workoutProgramUuid"
    />
</template>

<script>
import ProgramBuilder from '../domain/programBuilder/ProgramBuilder';
import { useAppStore } from '../../stores/app';

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
        const appStore = useAppStore();
        return { appStore };
    },
    computed: {
        userIsAuthenticated() {
            return this.appStore.userIsAuthenticated;
        },
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
