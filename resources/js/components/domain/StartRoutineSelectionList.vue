<template>
    <div>
        <VSkeletonLoader v-if="loading" class="ma-5" type="card@10" />
        <NarrowContentContainer v-else>
            <RoutineCard
                v-for="routine in routines"
                :key="routine.uuid"
                :routine="routine"
            />
        </NarrowContentContainer>
    </div>
</template>

<script>
import RoutineCard from './RoutineCard';
import WorkoutRoutineService from '../../api/WorkoutRoutineService';
import NarrowContentContainer from '../layouts/NarrowContentContainer';

export default {
    components: {
        NarrowContentContainer,
        RoutineCard,
    },
    created() {
        this.fetchRoutines();
    },
    data() {
        return {
            routines: [],
            loading: true,
        };
    },
    methods: {
        async fetchRoutines() {
            this.loading = true;
            const response = await WorkoutRoutineService.getAll();

            this.routines = response.data;
            this.loading = false;
        },
    },
};
</script>
