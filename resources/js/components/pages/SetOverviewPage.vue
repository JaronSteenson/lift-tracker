<template>
    <div v-if="userIsAuthenticated">
        <SessionOverviewLoadingSkeleton v-if="loading" />
        <div v-else>
            <NotFound v-if="notFound">
                Sorry we couldn't find that set.
            </NotFound>
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
import { useAppStore } from '../../stores/app';
import { useWorkoutSessionStore } from '../../stores/workoutSession';
import { useProgramBuilderStore } from '../../stores/programBuilder';

export default {
    name: 'SetOverviewPage',
    components: {
        NotFound,
        SessionOverviewLoadingSkeleton,
        SetOverview,
    },
    props: {
        fromCheckIn: {
            type: String,
            required: false,
            default: '',
        },
        sessionSetUuid: {
            type: String,
            required: true,
        },
    },
    setup() {
        const appStore = useAppStore();
        const workoutSessionStore = useWorkoutSessionStore();
        const programBuilderStore = useProgramBuilderStore();
        return { appStore, workoutSessionStore, programBuilderStore };
    },
    created() {
        this.ensureWorkoutSessionIsLoadedLoaded();
    },
    data() {
        return {
            loading: true,
            fetchError: false,
        };
    },
    computed: {
        userIsAuthenticated() {
            return this.appStore.userIsAuthenticated;
        },
        notFound() {
            return !this.loading && this.fetchError;
        },
    },
    watch: {
        $route() {
            this.ensureWorkoutSessionIsLoadedLoaded();
        },
    },
    methods: {
        async ensureWorkoutSessionIsLoadedLoaded() {
            if (
                this.workoutSessionStore.workoutSessionIsLoaded(
                    this.workoutSessionUuid,
                )
            ) {
                this.loading = false;
                return;
            }

            this.loading = true;
            this.fetchError = false;

            try {
                await this.workoutSessionStore.fetchBySet(this.sessionSetUuid);
            } catch (e) {
                this.fetchError = true;
            }

            this.loading = false;

            if (this.fromCheckIn) {
                await this.$router.replace({
                    name: 'SetOverviewPage',
                    params: {
                        sessionSetUuid: this.sessionSetUuid,
                        fromCheckIn: '',
                    },
                });
            }

            this.loading = false;
        },
    },
};
</script>

<style lang="scss"></style>
