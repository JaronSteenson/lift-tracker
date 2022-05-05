<template>
    <VCard>
        <VCardTitle>
            <RouterLink
                v-if="linkTitle"
                :to="{
                    name: 'SessionOverviewPage',
                    params: { workoutSessionUuid: workoutSession.uuid },
                }"
            >
                {{ workoutSession.name }}
            </RouterLink>
            <template v-else>{{ workoutSession.name }}</template>
        </VCardTitle>
        <VCardSubtitle>
            From
            <ProgramName
                :workoutProgram="
                    workoutSession.workoutProgramRoutine.workoutProgram
                "
            />
        </VCardSubtitle>
        <VCardText>
            <SessionStats :workoutSession="workoutSession" />
        </VCardText>
        <VCardActions>
            <VBtn
                small
                :to="{
                    name: 'NewSessionOverviewPage',
                    params: {
                        originRoutineUuid:
                            workoutSession.workoutProgramRoutine.uuid,
                    },
                }"
            >
                Repeat
                <VIcon small color="green">
                    {{ $svgIcons.repeat }}
                </VIcon>
            </VBtn>
        </VCardActions>
    </VCard>
</template>

<script>
import ProgramName from '../../domain/programBuilder/ProgramName';
import SessionStats from './SessionStats';

export default {
    components: {
        SessionStats,
        ProgramName,
    },
    props: {
        workoutSession: {
            type: Object,
            required: true,
        },
        linkTitle: {
            type: Boolean,
            required: false,
        },
    },
};
</script>
