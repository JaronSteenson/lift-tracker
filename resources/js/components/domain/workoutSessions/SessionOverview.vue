<template>
    <div>
        <SessionOverviewLoadingSkeleton v-if="loading"/>
        <div v-else>
            <NotFound v-if="notFound">Sorry we couldn't find that routine.</NotFound>
            <template v-else>
                <WorkoutCard :workoutUuid="originRoutineUuid" is-session-overview class="mb-10"></WorkoutCard>
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
        }
    }
</script>

<style lang="scss">

</style>
