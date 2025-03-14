<template>
    <VNavigationDrawer
        v-if="userIsAuthenticated"
        v-model="drawer"
        app
        :clipped="false"
    >
        <VList dense>
            <div :key="workout.uuid" v-for="workout in inProgressWorkouts">
                <VListItem
                    :key="workout.uuid"
                    link
                    :to="{
                        name: 'SessionOverviewPage',
                        params: { workoutSessionUuid: workout.uuid },
                    }"
                >
                    <VListItemAction>
                        <VIcon color="success">
                            {{ $svgIcons.workoutSessionnInProgress }}
                        </VIcon>
                    </VListItemAction>
                    <VListItemContent>
                        <VListItemTitle v-if="workoutIsInFocus(workout.uuid)">
                            In progress workout
                        </VListItemTitle>
                        <VListItemTitle v-else>Resume workout</VListItemTitle>
                        <VListItemSubtitle>
                            {{ workout.name }}
                        </VListItemSubtitle>
                    </VListItemContent>
                </VListItem>

                <VListItem
                    :key="getCurrentSet(workout.uuid).uuid"
                    link
                    :to="{
                        name: 'SetOverviewPage',
                        params: {
                            sessionSetUuid: getCurrentSet(workout.uuid).uuid,
                        },
                    }"
                >
                    <VListItemAction>
                        <VIcon color="success">
                            {{ $svgIcons.mdiPlayPause }}
                        </VIcon>
                    </VListItemAction>
                    <VListItemContent>
                        <VListItemTitle
                            v-if="setIsInFocus(getCurrentSet(workout.uuid))"
                        >
                            In progress set
                        </VListItemTitle>
                        <VListItemTitle v-else>Resume set</VListItemTitle>
                        <VListItemSubtitle>
                            {{ getCurrentSet(workout.uuid).exercise.name }}
                            - set
                            {{ getCurrentSet(workout.uuid).position + 1 }}
                        </VListItemSubtitle>
                    </VListItemContent>
                </VListItem>
            </div>

            <VDivider
                v-if="inProgressWorkouts && inProgressWorkouts.length > 0"
            />
            <VListItem
                v-if="!inProgressWorkouts || inProgressWorkouts.length === 0"
                link
                :to="{ name: 'NewSessionRoutineSelectPage' }"
            >
                <VListItemAction>
                    <VIcon color="primary">{{ $svgIcons.mdiPlay }}</VIcon>
                </VListItemAction>
                <VListItemContent>
                    <VListItemTitle>Start new session</VListItemTitle>
                </VListItemContent>
            </VListItem>
            <VListItem link :to="{ name: 'MyWorkoutProgramsPage' }">
                <VListItemAction>
                    <VIcon color="primary">{{
                        $svgIcons.workoutProgram
                    }}</VIcon>
                </VListItemAction>
                <VListItemContent>
                    <VListItemTitle>My workout programs</VListItemTitle>
                </VListItemContent>
            </VListItem>
            <VListItem link :to="{ name: 'ProgramBuilderPageNew' }">
                <VListItemAction>
                    <VIcon color="primary">{{ $svgIcons.mdiPlus }}</VIcon>
                </VListItemAction>
                <VListItemContent>
                    <VListItemTitle>Build new workout program</VListItemTitle>
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
