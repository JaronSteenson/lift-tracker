<template>
    <div>
        <SessionOverviewLoadingSkeleton v-if="loading"/>
        <div v-else>
            <NotFound v-if="notFound">Sorry we couldn't find that workout session.</NotFound>
            <template v-else>
                <VContainer fill-height v-if="$vuetify.breakpoint.mdAndUp">
                    <VRow align="center" justify="center">
                        <VCol cols="12" md="6">
                            <SessionOverview :workout-session-uuid="workoutSessionUuid"/>
                        </VCol>
                    </VRow>
                </VContainer>
                <SessionOverview v-else :workout-session-uuid="workoutSessionUuid"/>
            </template>
        </div>
    </div>
</template>

<script>
    import SessionOverview from '../domain/workoutSessions/SessionOverview';
    import NotFound from "../routing/NotFound";
    import SessionOverviewLoadingSkeleton from "../domain/workoutSessions/SessionOverviewLoadingSkeleton";
    import SetOverview from "../domain/workoutSessions/SetOverview";

    export default {
        components: {
            SessionOverview,
            NotFound,
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
                debugger
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

<style lang="scss">

</style>
