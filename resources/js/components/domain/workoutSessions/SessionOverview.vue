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

        <VCardText class="py-0">
            <SessionDateTimeStats :workout-session="workoutSession"/>
        </VCardText>
    </component>
</template>

<script>
    import NotFound from '../../routing/NotFound';
    import SessionOverviewLoadingSkeleton from './SessionOverviewLoadingSkeleton';
    import SessionDateTimeStats from './SessionDateTimeStats';
    import WorkoutCard from './../programBuilder/WorkoutCard';
    import {mapGetters} from "vuex";

    export default {
        components: {
            NotFound,
            SessionOverviewLoadingSkeleton,
            WorkoutCard,
            SessionDateTimeStats,
        },
        props: {
            originRoutineUuid: String,
            workoutSessionUuid: String,
        },
        computed: {
            ...mapGetters('workoutSession', ['workoutName', 'workoutSession']),
        },
    }
</script>

<style lang="scss">

</style>
