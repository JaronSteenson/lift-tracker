<template>
    <div>
        <AppBar
            :title="pageTitle"
            :back-to="
                $route.params.workoutSessionUuid
                    ? {
                          name: 'SessionOverviewPage',
                          params: {
                              workoutSessionUuid:
                                  $route.params.workoutSessionUuid,
                          },
                      }
                    : { name: 'HomePage' }
            "
        >
            <template v-slot:right>
                <VMenu bottom left>
                    <template v-slot:activator="{ props }">
                        <VBtn icon flat v-bind="props">
                            <VIcon>{{ $svgIcons.mdiDotsVertical }}</VIcon>
                        </VBtn>
                    </template>

                    <VList>
                        <VListItem
                            :disabled="workoutSessionData.createdAt === null"
                            @click="showDeleteConfirmation"
                        >
                            <VListItemTitle>Delete</VListItemTitle>
                        </VListItem>
                    </VList>
                </VMenu>
            </template>
        </AppBar>

        <NarrowContentContainer>
            <VContainer class="py-0">
                <VForm @submit.prevent="save">
                    <VTextField
                        class=""
                        v-model="workoutSessionData.name"
                        label="Title"
                        hide-details
                        single-line
                    />
                    <VTextField
                        class=""
                        autofocus
                        label="Body weight (kg)"
                        type="number"
                        :step="1"
                        :max="9999"
                        :min="0"
                        v-model.number="workoutSessionData.bodyWeight"
                    />
                    <VTextarea
                        auto-grow
                        filled
                        label="Notes"
                        v-model="workoutSessionData.notes"
                    />
                    <VBtn
                        elevation="1"
                        width="100%"
                        type="submit"
                        :loading="saving"
                        >Save</VBtn
                    >
                </VForm>
            </VContainer>
        </NarrowContentContainer>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import NarrowContentContainer from '../../layouts/NarrowContentContainer';
import AppBar from '../../AppBar';
import { createCheckIn } from '../../../domain/createSessionFromBuilderWorkout';
import {
    useWorkoutSession,
    useUpdateWorkoutSession,
    useDeleteWorkoutSession,
    getFirstSet,
} from './composibles/workoutSessionQueries';
import { svgIcons } from '../../../vuetify';

const props = defineProps({
    toFirstSetAfterSave: Boolean,
});

const router = useRouter();
const route = useRoute();

const saving = ref(false);

// Load existing workout session if editing
const { workoutSession: existingSession } = useWorkoutSession(
    computed(() => route.params.workoutSessionUuid),
);

// Local data for the form
const workoutSessionData = ref(
    route.params.workoutSessionUuid && existingSession.value
        ? existingSession.value
        : createCheckIn(),
);

// Update local data when existing session loads
watch(existingSession, (session) => {
    if (session && route.params.workoutSessionUuid) {
        workoutSessionData.value = session;
    }
});

const { updateWorkoutSession } = useUpdateWorkoutSession();
const { deleteWorkoutSession } = useDeleteWorkoutSession();

const pageTitle = computed(() =>
    route.params.workoutSessionUuid ? 'Edit check-in' : 'New check-in',
);

async function save() {
    saving.value = true;

    // Save check-in
    updateWorkoutSession(workoutSessionData.value);

    // Wait a bit for the mutation to complete
    await new Promise((resolve) => setTimeout(resolve, 500));

    const workoutSession = workoutSessionData.value;

    if (props.toFirstSetAfterSave) {
        const firstSet = getFirstSet(workoutSession);
        await router.push({
            name: 'SetOverviewPage',
            params: {
                sessionSetUuid: firstSet.uuid,
                fromCheckIn: true,
            },
        });
        return;
    }

    await router.push({
        name: 'SessionOverviewPage',
        params: { workoutSessionUuid: workoutSession.uuid },
    });
    saving.value = false;
}

async function showDeleteConfirmation() {
    const deleteConfirmed = window.confirm(
        'Are you sure you want to delete this record?',
    );

    if (deleteConfirmed) {
        deleteWorkoutSession(workoutSessionData.value.uuid);
        router.replace({ name: 'HomePage' });
    }
}
</script>
