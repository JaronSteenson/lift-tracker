<template>
    <VCard class="routine-card">
        <VCardTitle>{{ routine.name }}</VCardTitle>
        <VCardText>
            <div>
                <VIcon color="primary">{{ $svgIcons.sessionDate }}</VIcon>
                <RouterLink
                    v-if="routine.latestSession"
                    :to="{
                        name: 'SessionOverviewPage',
                        params: {
                            workoutSessionUuid: routine.latestSession.uuid,
                        },
                    }"
                >
                    {{ dateDescription(routine.latestSession.startedAt) }}
                </RouterLink>
                <MissingValue v-else>Not used yet</MissingValue>
            </div>
            <div class="mt-2">
                <VIcon color="primary">{{ $svgIcons.workoutProgram }}</VIcon>
                <ProgramName :workoutProgram="routine.workoutProgram" />
            </div>
        </VCardText>
        <div class="d-flex">
            <VBtn
                width="50%"
                :to="{
                    name: 'NewSessionOverviewPage',
                    params: { originRoutineUuid: routine.uuid },
                }"
            >
                Prepare
                <VIcon color="primary">{{ $svgIcons.workoutProgram }}</VIcon>
            </VBtn>
            <VBtn width="50%" :loading="starting" @click="startNow">
                Start now <VIcon color="green">{{ $svgIcons.mdiPlay }}</VIcon>
            </VBtn>
        </div>
    </VCard>
</template>

<script>
import { dateDescription } from '../../dates';
import MissingValue from '../util/MissingValue';
import ProgramName from '../domain/programBuilder/ProgramName';

export default {
    components: {
        MissingValue,
        ProgramName,
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
    computed: {},
    methods: {
        dateDescription,
        async startNow() {
            this.starting = true;

            // Create a new workout session from the updated master routine.
            await this.$store.dispatch('workoutSession/startWorkout', {
                originWorkoutUuid: this.routine.uuid,
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
