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
import { mapGetters } from 'vuex';
import CheckInEditForm from '../domain/workoutSessions/CheckInEditForm';

export default {
    components: {
        CheckInEditForm,
        NotFoundPage,
        SessionOverviewLoadingSkeleton,
    },
    props: {
        workoutSessionUuid: {
            type: String,
            required: false,
        },
        toFirstSetAfterSave: Boolean,
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
        ...mapGetters('app', ['userIsAuthenticated']),
        notFound() {
            return !this.loading && this.fetchError;
        },
    },
    methods: {
        async ensureWorkoutSessionIsLoaded() {
            if (!this.workoutSessionUuid) {
                this.loading = false;
                return;
            }

            if (
                this.$store.getters['workoutSession/workoutSessionIsLoaded'](
                    this.workoutSessionUuid
                )
            ) {
                this.loading = false;
                return;
            }

            this.loading = true;

            try {
                await this.$store.dispatch(
                    'workoutSession/fetch',
                    this.workoutSessionUuid
                );
            } catch (e) {
                this.fetchError = true;
            }

            this.loading = false;
        },
    },
};
</script>
