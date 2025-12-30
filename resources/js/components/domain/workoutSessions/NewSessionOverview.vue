<template>
    <div>
        <SessionOverviewLoadingSkeleton v-if="isPending" />
        <div v-else>
            <NotFound v-if="notFound">
                Sorry we couldn't find that routine.
            </NotFound>
            <NarrowContentContainer v-else>
                <WorkoutCard
                    :workoutUuid="originRoutineUuid"
                    :workoutProgramProp="workoutProgram"
                    :routineUuid="originRoutineUuid"
                    is-session-overview
                />
            </NarrowContentContainer>
        </div>
    </div>
</template>

<script setup>
import { computed, toRef } from 'vue';
import NotFound from '../../routing/NotFound';
import SessionOverviewLoadingSkeleton from './SessionOverviewLoadingSkeleton';
import WorkoutCard from './../programBuilder/WorkoutCard';
import NarrowContentContainer from '../../layouts/NarrowContentContainer';
import { useWorkoutProgramByRoutine } from '../programBuilder/composibles/programBuilderQueries';

const props = defineProps({
    originRoutineUuid: {
        type: String,
        required: true,
    },
    workoutSessionUuid: {
        type: String,
    },
});

const { workoutProgram, isPending } = useWorkoutProgramByRoutine(
    toRef(props, 'originRoutineUuid'),
);

const notFound = computed(() => {
    return !isPending.value && !workoutProgram.value;
});
</script>

<style lang="scss"></style>
