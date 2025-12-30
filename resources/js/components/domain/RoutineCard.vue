<template>
    <VCard>
        <VCardTitle>
            <RouterLink
                v-if="routine.latestSession"
                :to="{
                    name: 'SessionOverviewPage',
                    params: { workoutSessionUuid: routine.latestSession.uuid },
                }"
            >
                {{ routine.name }}
            </RouterLink>
            <template v-else>{{ routine.name }}</template>
        </VCardTitle>
        <VCardSubtitle>
            From
            <ProgramName :workoutProgram="routine.workoutProgram" />
        </VCardSubtitle>
        <VCardActions>
            <VBtn
                elevation="1"
                size="small"
                :to="{
                    name: 'NewSessionOverviewPage',
                    params: { originRoutineUuid: routine.uuid },
                }"
            >
                Prepare
                <VIcon size="small" color="primary">
                    {{ $svgIcons.workoutProgram }}
                </VIcon>
            </VBtn>
            <VBtn
                elevation="1"
                size="small"
                :loading="starting"
                @click="startNow"
            >
                Start now
                <VIcon size="small" color="green">{{
                    $svgIcons.mdiPlay
                }}</VIcon>
            </VBtn>
        </VCardActions>
    </VCard>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import MissingValue from '../util/MissingValue';
import ProgramName from '../domain/programBuilder/ProgramName';
import { useStartWorkout } from './workoutSessions/composibles/workoutSessionQueries';

const props = defineProps({
    routine: {
        type: Object,
        required: true,
    },
});

const router = useRouter();
const { startWorkout } = useStartWorkout();

const starting = ref(false);

async function startNow() {
    starting.value = true;

    // Get myWorkoutSessions from localStorage
    const stored = localStorage.getItem('store-state--WorkoutSession');
    const parsed = stored ? JSON.parse(stored) : {};
    const myWorkoutSessions = parsed.myWorkoutSessions || [];

    // Create a new workout session from the updated master routine
    startWorkout(
        {
            originWorkout: props.routine,
            myWorkoutSessions,
        },
        {
            onSuccess: (workoutSession) => {
                // Check in
                router.push({
                    name: 'CheckInEditPage',
                    params: {
                        workoutSessionUuid: workoutSession.uuid,
                    },
                    query: {
                        toFirstSetAfterSave: true,
                    },
                });
                starting.value = false;
            },
            onError: () => {
                starting.value = false;
            },
        },
    );
}
</script>

<style scoped></style>
