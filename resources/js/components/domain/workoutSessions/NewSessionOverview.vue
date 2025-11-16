<template>
    <div>
        <SessionOverviewLoadingSkeleton v-if="isPending" />
        <div v-else>
            <NotFound v-if="notFound">
                Sorry we couldn't find that routine.
            </NotFound>
            <NarrowContentContainer v-else>
                <WorkoutCard
                    :workoutProgramUuid="workoutProgram.uuid"
                    :workoutUuid="originRoutineUuid"
                    is-session-overview
                />
            </NarrowContentContainer>
        </div>
    </div>
</template>

<script>
import NotFound from '../../routing/NotFound';
import SessionOverviewLoadingSkeleton from './SessionOverviewLoadingSkeleton';
import WorkoutCard from './../programBuilder/WorkoutCard';
import NarrowContentContainer from '../../layouts/NarrowContentContainer';
import { useProgramBuilderStore } from '../../../stores/programBuilder';
import { useWorkoutProgramByRoutine } from '../programBuilder/composibles/programBuilderQueries';

export default {
    components: {
        NarrowContentContainer,
        NotFound,
        SessionOverviewLoadingSkeleton,
        WorkoutCard,
    },
    setup() {
        const props = defineProps({
            originRoutineUuid: String,
            workoutSessionUuid: String,
        });

        const { workoutProgram, isPending } = useWorkoutProgramByRoutine(
            props.originRoutineUuid,
        );

        return {
            originRoutineUuid: props.originRoutineUuid,
            workoutProgram,
            isPending,
        };
    },
    data() {
        return {
            loading: false,
            fetchError: false,
        };
    },
    computed: {
        notFound() {
            return !this.loading && this.fetchError;
        },
    },
};
</script>

<style lang="scss"></style>
