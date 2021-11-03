<template>
    <div>
        <SessionOverviewLoadingSkeleton v-if="loading"/>
        <template v-else>
            <NotFoundPage v-if="notFound">Sorry we couldn't find that workout session.</NotFoundPage>
            <SessionOverview v-else :workout-session-uuid="workoutSessionUuid"/>
        </template>
    </div>
</template>

<script>
    import SessionOverview from '../domain/workoutSessions/SessionOverview';
    import NotFoundPage from "../pages/NotFoundPage";
    import SessionOverviewLoadingSkeleton from "../domain/workoutSessions/SessionOverviewLoadingSkeleton";
    import SetOverview from "../domain/workoutSessions/SetOverview";

    export default {
        components: {
            SessionOverview,
            NotFoundPage,
            SessionOverviewLoadingSkeleton,
            SetOverview,
        },
        props: {
            workoutSessionUuid: {
                type: String,
                required: true,
            },
        },
        data() {
            return {
                loading: false,
                fetchError: false,
            }
        },
        created() {
            this.ensureWorkoutSessionIsLoaded();
        },
        watch: {
            workoutSessionUuid(newUuid, oldUuid) {
                if (newUuid !== oldUuid) {
                    this.ensureWorkoutSessionIsLoaded();
                }
            },
        },
        computed: {
            notFound() {
                return !this.loading && this.fetchError;
            },
        },
        methods: {
            async ensureWorkoutSessionIsLoaded() {
                if (this.$store.getters['workoutSession/workoutSessionIsLoaded'](this.workoutSessionUuid)) {
                    return;
                }

                this.loading = true;

                try {
                    await this.$store.dispatch('workoutSession/fetch', this.workoutSessionUuid);
                } catch (e) {
                    this.fetchError = true;
                }

                this.loading = false;
            }
        }
    }
</script>
