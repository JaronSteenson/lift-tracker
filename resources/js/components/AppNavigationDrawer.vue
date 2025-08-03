<template>
    <VNavigationDrawer
        v-if="userIsAuthenticated"
        v-model="drawer"
        app
        :clipped="false"
    >
        <VList dense>
            <VListItem link :to="{ name: 'HomePage' }">
                <VListItemAction>
                    <VIcon color="primary">
                        {{ $svgIcons.workoutSession }}
                    </VIcon>
                </VListItemAction>
                <VListItemContent>
                    <VListItemTitle>My records</VListItemTitle>
                </VListItemContent>
            </VListItem>
            <VDivider />
            <VListItem link :to="{ name: 'MyWorkoutProgramsPage' }">
                <VListItemAction>
                    <VIcon color="primary">
                        {{ $svgIcons.workoutProgram }}
                    </VIcon>
                </VListItemAction>
                <VListItemContent>
                    <VListItemTitle>My workout programs</VListItemTitle>
                </VListItemContent>
            </VListItem>
        </VList>
    </VNavigationDrawer>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

export default {
    computed: {
        ...mapState('app', ['navigationDrawerOpen']),
        ...mapGetters('app', ['userIsAuthenticated']),
        ...mapGetters('workoutSession', [
            'hasLoadedInProgressWorkouts',
            'inProgressWorkouts',
        ]),
        drawer: {
            get() {
                return this.navigationDrawerOpen;
            },
            set(value) {
                this.$store.dispatch('app/setNavigationDrawerOpen', value);
            },
        },
    },
    methods: {
        workoutIsInFocus(workoutSessionUuid) {
            if (
                this.$route.name !== 'SetOverviewPage' &&
                this.$route.name !== 'SessionOverviewPage'
            ) {
                return false;
            }

            return (
                this.$store.getters['workoutSession/workoutSession']?.uuid ===
                workoutSessionUuid
            );
        },
        setIsInFocus(set) {
            return (
                this.$route.name === 'SetOverviewPage' &&
                this.$route.params.sessionSetUuid === set.uuid
            );
        },
        getCurrentSet(workoutSessionUuid) {
            return this.$store.getters[
                'workoutSession/currentSetForInProgressWorkout'
            ](workoutSessionUuid);
        },
    },
};
</script>

<style scoped></style>
