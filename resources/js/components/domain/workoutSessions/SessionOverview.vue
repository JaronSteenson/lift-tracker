<template>
    <div>
        <SessionOverviewLoadingSkeleton v-if="loading"/>
        <div v-else>
            <NotFound v-if="notFound">Sorry we couldn't find that routine.</NotFound>
            <template v-else>
                <VContainer v-if="$vuetify.breakpoint.mdAndUp" fill-height>
                    <VRow justify="center" align="center">
                        <VCol cols="12" md="6">
                            <WorkoutCard :workoutUuid="originRoutineUuid" is-session-overview></WorkoutCard>
                        </VCol>
                    </VRow>
                </VContainer>
                <WorkoutCard v-else :workoutUuid="originRoutineUuid" is-session-overview></WorkoutCard>
            </template>
        </div>
    </div>
</template>

<script>
    import NotFound from '../../routing/NotFound';
    import SessionOverviewLoadingSkeleton from './SessionOverviewLoadingSkeleton';
    import WorkoutCard from './../programBuilder/WorkoutCard';

    export default {
        components: {
            NotFound,
            SessionOverviewLoadingSkeleton,
            WorkoutCard,
        },
        props: {
            originRoutineUuid: String,
            workoutSessionUuid: String,
        },
        data() {
            return {
                loading: false,
                fetchError: false,
            }
        },
        async created() {
            if (this.originRoutineUuid) {
                this.loading = true;

                try {
                    await this.$store.dispatch('programBuilder/prepareForSessionOverview', this.originRoutineUuid);
                } catch (e) {
                    this.fetchError = true;
                }

                this.loading = false;
            }
        },
        computed: {
            notFound() {
                return !this.loading && this.fetchError;
            },
        },
    }
</script>

<style lang="scss">

</style>
