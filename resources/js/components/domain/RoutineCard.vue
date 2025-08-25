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
        <VCardText v-if="mostRecentDate">
            Last completed <MissingValue>{{ mostRecentDate }}</MissingValue>
        </VCardText>
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

<script>
import MissingValue from '../util/MissingValue';
import ProgramName from '../domain/programBuilder/ProgramName';
import { dateTimeDescription } from '../../dates';
import { useWorkoutSessionStore } from '../../stores/workoutSession';

export default {
    components: {
        MissingValue,
        ProgramName,
    },
    setup() {
        const workoutSessionStore = useWorkoutSessionStore();
        return { workoutSessionStore };
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
    computed: {
        mostRecentDate() {
            const mostRecent = this.workoutSessionStore.mostRecent(
                this.routine.uuid,
            );
            if (mostRecent) {
                return dateTimeDescription(mostRecent.endedAt);
            }

            return undefined;
        },
    },
    methods: {
        async startNow() {
            this.starting = true;

            // Create a new workout session from the updated master routine.
            await this.workoutSessionStore.startWorkout({
                originWorkout: this.routine,
            });

            // Check in.
            await this.$router.push({
                name: 'CheckInEditPage',
                params: {
                    workoutSessionUuid:
                        this.workoutSessionStore.workoutSession.uuid,
                },
                query: {
                    toFirstSetAfterSave: true,
                },
            });
            this.starting = false;
        },
    },
};
</script>

<style scoped></style>
