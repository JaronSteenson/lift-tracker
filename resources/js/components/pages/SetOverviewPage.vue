<template>
    <div>
        <SessionOverviewLoadingSkeleton v-if="loading"/>
        <div v-else>
            <NotFound v-if="notFound">Sorry we couldn't find that set.</NotFound>
            <template v-else>
                <VContainer fill-height v-if="$vuetify.breakpoint.mdAndUp">
                    <VRow align="center" justify="center">
                        <VCol cols="12" md="6">
                            <SetOverview :sessionSetUuid="sessionSetUuid"></SetOverview>
                        </VCol>
                    </VRow>
                </VContainer>
                <SetOverview :sessionSetUuid="sessionSetUuid"></SetOverview>
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
        data() {
            return {
                loading: false,
                fetchError: false,
            }
        },
        async created() {
            this.loading = true;

            // try {
            //     await this.$store.dispatch('programBuilder/prepareForSessionOverview', this.originRoutineUuid);
            // } catch (e) {
            //     this.fetchError = true;
            // }

            this.loading = false;
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
