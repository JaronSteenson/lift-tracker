<template>
    <div>
        <SessionOverviewLoadingSkeleton v-if="loading"/>
        <div v-else>
            <NotFound v-if="notFound">Sorry we couldn't find that set.</NotFound>
            <template v-else>
                <VContainer fill-height v-if="$vuetify.breakpoint.mdAndUp">
                    <VRow align="center" justify="center">
                        <VCol cols="12" md="6">
                            <SetOverview :sessionSetUuid="sessionSetUuid"/>
                        </VCol>
                    </VRow>
                </VContainer>
                <SetOverview v-else :sessionSetUuid="sessionSetUuid"/>
            </template>
        </div>
    </div>
</template>

<script>
    import NotFound from "../routing/NotFound";
    import SessionOverviewLoadingSkeleton from "../domain/workoutSessions/SessionOverviewLoadingSkeleton";
    import SetOverview from "../domain/workoutSessions/SetOverview";

    export default {
        components: {
            NotFound,
            SessionOverviewLoadingSkeleton,
            SetOverview,
        },
        props: {
            sessionSetUuid: {
                type: String,
                required: true,
            },
        },
        created() {
            this.ensureWorkoutSessionIsLoadedLoaded();
        },
        data() {
            return {
                loading: false,
                fetchError: false,
            }
        },
        computed: {
            notFound() {
                return !this.loading && this.fetchError;
            },
        },
        watch: {
            $route: 'ensureWorkoutSessionIsLoadedLoaded',
        },
        methods: {
            async ensureWorkoutSessionIsLoadedLoaded() {
                if (this.$store.getters['workoutSession/hasSetInSession'](this.sessionSetUuid)) {
                    return;
                }

                this.loading = true;

                try {
                    await this.$store.dispatch('workoutSession/fetchBySet', this.sessionSetUuid);
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
