<template>
    <div v-if="userIsAuthenticated">
        <SessionOverviewLoadingSkeleton
            v-if="isPending && workoutSessionUuid"
        />
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

<script setup>
import { computed, toRef } from 'vue';
import { useRoute } from 'vue-router';
import NotFoundPage from '../pages/NotFoundPage';
import SessionOverviewLoadingSkeleton from '../domain/workoutSessions/SessionOverviewLoadingSkeleton';
import { useAuth } from '../domain/auth/composables/useAuth';
import { useWorkoutSession } from '../domain/workoutSessions/composibles/workoutSessionQueries';
import CheckInEditForm from '../domain/workoutSessions/CheckInEditForm';

const props = defineProps({
    workoutSessionUuid: {
        type: String,
        required: false,
    },
});

const route = useRoute();
const { userIsAuthenticated } = useAuth();

const { isPending, error } = useWorkoutSession(
    toRef(props, 'workoutSessionUuid'),
);

const notFound = computed(
    () => !isPending.value && error.value && props.workoutSessionUuid,
);

const toFirstSetAfterSave = computed(
    () => route.query.toFirstSetAfterSave === 'true',
);
</script>
