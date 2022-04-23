<template>
    <div>
        <VSkeletonLoader v-if="loading" class="ma-5" type="card@10" />
        <VSheet v-else>
            <VRow>
                <VCol
                    v-for="(routine, index) in routines"
                    :key="index"
                    cols="12"
                    lg="3"
                    md="4"
                    sm="6"
                >
                    <RoutineCard :routine="routine" />
                </VCol>
            </VRow>
        </VSheet>
    </div>
</template>

<script>
import RoutineCard from './RoutineCard';
import WorkoutRoutineService from '../../api/WorkoutRoutineService';

export default {
    components: {
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
