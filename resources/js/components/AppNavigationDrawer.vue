<template>
    <VNavigationDrawer
        v-if="userIsAuthenticated"
        v-model="drawer"
        app
        :clipped="false"
    >
        <VList dense>
            <VListItem link :to="{ name: 'HomePage' }">
                <template v-slot:prepend>
                    <VIcon color="primary">
                        {{ svgIcons.workoutSession }}
                    </VIcon>
                </template>
                <VListItemTitle>Timeline</VListItemTitle>
            </VListItem>
            <VDivider />
            <VListItem link :to="{ name: 'MyWorkoutProgramsPage' }">
                <template v-slot:prepend>
                    <VIcon color="primary">
                        {{ svgIcons.workoutProgram }}
                    </VIcon>
                </template>
                <VListItemTitle>My workout programs</VListItemTitle>
            </VListItem>
        </VList>
    </VNavigationDrawer>
</template>

<script>
import { useAppStore } from '../stores/app';
import { useWorkoutSessionStore } from '../stores/workoutSession';
import { svgIcons } from '../vuetify';
import { computed } from 'vue';

export default {
    name: 'AppNavigationDrawer',
    setup() {
        const appStore = useAppStore();
        const workoutSessionStore = useWorkoutSessionStore();

        const drawer = computed({
            get() {
                return appStore.navigationDrawerOpen;
            },
            set(value) {
                appStore.setNavigationDrawerOpen(value);
            },
        });

        return {
            appStore,
            workoutSessionStore,
            svgIcons,
            drawer,
        };
    },
    computed: {
        userIsAuthenticated() {
            return this.appStore.userIsAuthenticated;
        },
        hasLoadedInProgressWorkouts() {
            // TODO: Implement in workoutSession store
            return false;
        },
        inProgressWorkouts() {
            // TODO: Implement in workoutSession store
            return [];
        },
    },
    methods: {
        workoutIsInFocus() {
            if (
                this.$route.name !== 'SetOverviewPage' &&
                this.$route.name !== 'SessionOverviewPage'
            ) {
                return false;
            }

            // TODO: Implement workoutSession getter in store
            return false;
        },
        setIsInFocus(set) {
            return (
                this.$route.name === 'SetOverviewPage' &&
                this.$route.params.sessionSetUuid === set.uuid
            );
        },
        getCurrentSet() {
            // TODO: Implement getter in workoutSession store
            return null;
        },
    },
};
</script>

<style scoped></style>
