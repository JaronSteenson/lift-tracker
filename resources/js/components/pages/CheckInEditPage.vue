<template>
    <div v-if="userIsAuthenticated">
        <SessionOverviewLoadingSkeleton v-if="loading" />
        <template v-else>
            <NotFoundPage v-if="notFound">
                Sorry we couldn't find that record.
            </NotFoundPage>
            <CheckInEditForm
                v-else
                :toFirstSetAfterSave="toFirstSetAfterSave"
            />
        </template>
    </div>
</template>

<script>
import NotFoundPage from '../pages/NotFoundPage';
import SessionOverviewLoadingSkeleton from '../domain/workoutSessions/SessionOverviewLoadingSkeleton';
import { useAppStore } from '../../stores/app';
import { useWorkoutSessionStore } from '../../stores/workoutSession';
import CheckInEditForm from '../domain/workoutSessions/CheckInEditForm';

export default {
    name: 'CheckInEditPage',
    components: {
        CheckInEditForm,
        NotFoundPage,
        SessionOverviewLoadingSkeleton,
    },
    setup() {
        const appStore = useAppStore();
        const workoutSessionStore = useWorkoutSessionStore();
        return { appStore, workoutSessionStore };
    },
    props: {
        workoutSessionUuid: {
            type: String,
            required: false,
        },
    },
    data() {
        return {
            loading: true,
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
        toFirstSetAfterSave() {
            return this.$route.query.toFirstSetAfterSave === 'true';
        },
    },
    methods: {
        async ensureWorkoutSessionIsLoaded() {
            if (!this.workoutSessionUuid) {
                this.loading = false;
                return;
            }

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
