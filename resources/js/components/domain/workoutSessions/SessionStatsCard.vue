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
            <VRow>
                <VCol
                    :key="index"
                    class="py-1"
                    cols="6"
                    v-for="(stat, index) in stats"
                >
                    <VIcon>{{ stat.icon }}</VIcon>
                    <span>{{ stat.value }}</span>
                </VCol>
            </VRow>
        </VCardText>
    </VCard>
</template>

<script>
import {
    dateDescription,
    hoursMinutesSecondsFromStartEnd,
    timeDescription,
} from '../../../dates';
import ProgramName from '../../domain/programBuilder/ProgramName';

export default {
    components: {
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
    computed: {
        stats() {
            return [
                {
                    icon: this.$svgIcons.sessionDate,
                    value: dateDescription(this.workoutSession.startedAt),
                },
                {
                    icon: this.$svgIcons.duration,
                    value: hoursMinutesSecondsFromStartEnd(
                        this.workoutSession.startedAt,
                        this.workoutSession.endedAt
                    ),
                },
                {
                    icon: this.$svgIcons.mdiPlay,
                    value: timeDescription(this.workoutSession.startedAt, true),
                },
                {
                    icon: this.$svgIcons.mdiStop,
                    value: timeDescription(this.workoutSession.endedAt, true),
                },
            ];
        },
    },
};
</script>
