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
        <VCardText>
            <SessionStats
                v-if="routine.latestSession"
                :workoutSession="routine.latestSession"
            />
            <MissingValue v-else>Routine not used yet</MissingValue>
        </VCardText>
        <VCardActions>
            <VBtn
                small
                width="50%"
                :to="{
                    name: 'NewSessionOverviewPage',
                    params: { originRoutineUuid: routine.uuid },
                }"
            >
                Prepare
                <VIcon small color="primary">
                    {{ $svgIcons.workoutProgram }}
                </VIcon>
            </VBtn>
            <VBtn small width="50%" :loading="starting" @click="startNow">
                Start now
                <VIcon small color="green">{{ $svgIcons.mdiPlay }}</VIcon>
            </VBtn>
        </VCardActions>
    </VCard>
</template>

<script>
import MissingValue from '../util/MissingValue';
import ProgramName from '../domain/programBuilder/ProgramName';
import SessionStats from './workoutSessions/SessionStats';

export default {
    components: {
        MissingValue,
        ProgramName,
        SessionStats,
    },
    props: {
        routine: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            starting: false,
        };
    },
    methods: {
        async startNow() {
            this.starting = true;

            // Create a new workout session from the updated master routine.
            await this.$store.dispatch('workoutSession/startWorkout', {
                originWorkout: this.routine,
            });

            // Then go to the first set in the workout.
            const firstSet = this.$store.getters['workoutSession/firstSet'];
            await this.$router.push({
                name: 'SetOverviewPage',
                params: { sessionSetUuid: firstSet.uuid },
            });
            this.starting = false;
        },
    },
};
</script>

<style scoped></style>
