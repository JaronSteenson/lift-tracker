<template>
    <component :elevation="this.$vuetify.breakpoint.smAndDown ? 0 : 5"
               :is="this.$vuetify.breakpoint.smAndDown ? 'div' : 'VCard'"
               max-width="960"
               width="100%"
    >
        <VToolbar flat>
            <VToolbarTitle>{{ workoutName }}</VToolbarTitle>

            <VSpacer/>
        </VToolbar>

        <VCardText class="pt-0">
            <hr>
            <SessionDateTimeStats :workout-session="workoutSession"/>
            <hr>

            <p class="mt-5" v-if="isInProgress">This workout is still in progress.
                <RouterLink
                    :to="{ name: 'setOverview', params: { sessionSetUuid: currentSet.uuid }}"
                >Jump to current set.
                </RouterLink>
            </p>

            <ExerciseSummaryCard
                class="mt-5"
                v-for="(sessionExercise) in sessionExercises"
                :exercise="sessionExercise"
                :key="sessionExercise.uuid"
            />
        </VCardText>
        <VCardActions>
            <VContainer class="text-center" fluid>
                <VRow justify="center">
                    <VCol cols="12">
                        <VBtn :to="{ name: 'home' }" class="home-button">
                            <VIcon>mdi-home</VIcon>
                            Go to home page
                        </VBtn>
                    </VCol>
                </VRow>
            </VContainer>
        </VCardActions>
    </component>
</template>

<script>
    import NotFound from '../../routing/NotFound';
    import SessionOverviewLoadingSkeleton from './SessionOverviewLoadingSkeleton';
    import SessionDateTimeStats from './SessionDateTimeStats';
    import WorkoutCard from './../programBuilder/WorkoutCard';
    import {mapGetters} from "vuex";
    import ExerciseSummaryCard from "./ExerciseSummaryCard";

    export default {
        components: {
            NotFound,
            SessionOverviewLoadingSkeleton,
            WorkoutCard,
            SessionDateTimeStats,
            ExerciseSummaryCard,
        },
        props: {
            originRoutineUuid: String,
            workoutSessionUuid: String,
        },
        computed: {
            ...mapGetters('workoutSession', ['workoutName', 'workoutSession', 'sessionExercises']),
            isInProgress() {
                return this.$store.getters['workoutSession/isInProgressWorkout'](this.workoutSession.uuid);
            },
            currentSet() {
                return this.$store.getters['workoutSession/currentSetForInProgressWorkout'](this.workoutSession.uuid);
            },
        },
    }
</script>

<style lang="scss">

</style>
