<template>
    <div v-if="userIsAuthenticated">
        <SessionOverviewLoadingSkeleton v-if="loading" />
        <div v-else>
            <NotFound v-if="notFound"
                >Sorry we couldn't find that set.</NotFound
            >
            <template v-else>
                <SetOverview :sessionSetUuid="sessionSetUuid" />
            </template>
        </div>
    </div>
</template>

<script>
import NotFound from '../routing/NotFound';
import SessionOverviewLoadingSkeleton from '../domain/workoutSessions/SessionOverviewLoadingSkeleton';
import SetOverview from '../domain/workoutSessions/SetOverview';
import { mapGetters } from 'vuex';

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
        };
    },
    computed: {
        ...mapGetters('app', ['userIsAuthenticated']),
        notFound() {
            return !this.loading && this.fetchError;
        },
    },
    watch: {
        $route(to, from) {
            debugger
            this.ensureWorkoutSessionIsLoadedLoaded();
        }
    },
    methods: {
        async ensureWorkoutSessionIsLoadedLoaded() {
            debugger
            if (
                this.$store.getters['workoutSession/setIsInFocusedSession'](
                    this.sessionSetUuid
                )
            ) {
                return;
            }

            this.loading = true;

            try {
                await this.$store.dispatch(
                    'workoutSession/fetchBySet',
                    this.sessionSetUuid
                );
                const workoutProgramRoutine = this.$store.state.workoutSession.workoutSession.workoutProgramRoutine
                if (workoutProgramRoutine) {
                    await this.$store.dispatch(
                        'programBuilder/prepareForSessionOverview',
                        workoutProgramRoutine.uuid,
                    );
                }
            } catch (e) {
                this.fetchError = true;
            }

            this.loading = false;
        },
    },
};
</script>

<style lang="scss"></style>
