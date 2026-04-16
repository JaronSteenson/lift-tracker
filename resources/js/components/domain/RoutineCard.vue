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

    try {
        const workoutSession = await startWorkout({
            originWorkout: props.routine,
        });

        await router.push({
            name: 'CheckInEditPage',
            params: {
                workoutSessionUuid: workoutSession.uuid,
            },
            query: {
                toFirstSetAfterSave: true,
            },
        });
    } finally {
        starting.value = false;
    }
}
</script>

<style scoped></style>
