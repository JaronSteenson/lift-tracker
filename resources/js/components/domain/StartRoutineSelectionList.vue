<template>
    <NarrowContentContainer>
        <VSkeletonLoader v-if="isPending" class="ma-5" type="card@10" />
        <RoutineCard
            v-else
            v-for="routine in routines"
            :key="routine.uuid"
            :routine="routine"
        />
    </NarrowContentContainer>
</template>

<script>
import RoutineCard from './RoutineCard';
import NarrowContentContainer from '../layouts/NarrowContentContainer';
import { useWorkoutProgramList } from './programBuilder/composibles/programBuilderQueries';

export default {
    name: 'StartRoutineSelectionList',
    components: {
        NarrowContentContainer,
        RoutineCard,
    },
    setup() {
        const { routines, isPending } = useWorkoutProgramList();
        return { routines, isPending };
    },
};
</script>
