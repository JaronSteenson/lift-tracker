<template>
    <div v-if="userIsAuthenticated">
        <SessionOverviewLoadingSkeleton v-if="loading" />
        <template v-else>
            <NotFoundPage v-if="notFound">
                Sorry we couldn't find that workout session.
            </NotFoundPage>
            <SessionOverview
                v-else
                :workout-session-uuid="workoutSessionUuid"
            />
        </template>
    </div>
</template>

<script>
import SessionOverview from '../domain/workoutSessions/SessionOverview';
import NotFoundPage from '../pages/NotFoundPage';
import SessionOverviewLoadingSkeleton from '../domain/workoutSessions/SessionOverviewLoadingSkeleton';
import { useAppStore } from '../../stores/app';
import { useWorkoutSessionStore } from '../../stores/workoutSession';

export default {
    name: 'SessionOverviewPage',
    components: {
        SessionOverview,
        NotFoundPage,
        SessionOverviewLoadingSkeleton,
    },
    props: {
        workoutSessionUuid: {
            type: String,
            required: true,
        },
    },
    setup() {
        const appStore = useAppStore();
        const workoutSessionStore = useWorkoutSessionStore();
        return { appStore, workoutSessionStore };
    },
    data() {
        return {
            loading: false,
            fetchError: false,
        };
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
        userIsAuthenticated() {
            return this.appStore.userIsAuthenticated;
        },
        notFound() {
            return !this.loading && this.fetchError;
        },
    },
    methods: {
        async ensureWorkoutSessionIsLoaded() {
            if (
                this.workoutSessionStore.workoutSessionIsLoaded(
                    this.workoutSessionUuid,
                )
            ) {
                return;
            }

            this.loading = true;
            this.fetchError = false;

            try {
                await this.workoutSessionStore.fetchWorkoutSession(
                    this.workoutSessionUuid,
                );
            } catch (e) {
                this.fetchError = true;
            }

            this.loading = false;
        },
    },
};
</script>
