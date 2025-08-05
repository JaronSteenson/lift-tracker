<template>
    <NarrowContentContainer>
        <VSkeletonLoader
            v-if="myWorkoutProgramsIsLoading"
            class="ma-5"
            type="card@10"
        />
        <RoutineCard
            v-else
            v-for="routine in myRoutines"
            :key="routine.uuid"
            :routine="routine"
        />
    </NarrowContentContainer>
</template>

<script>
import RoutineCard from './RoutineCard';
import NarrowContentContainer from '../layouts/NarrowContentContainer';
import { mapActions, mapGetters, mapState } from 'vuex';

export default {
    components: {
        NarrowContentContainer,
        RoutineCard,
    },
    created() {
        this.fetchMyWorkoutPrograms();
    },
    computed: {
        ...mapState('programBuilder', ['myWorkoutProgramsIsLoading']),
        ...mapGetters('programBuilder', ['myRoutines']),
    },
    methods: {
        ...mapActions('programBuilder', ['fetchMyWorkoutPrograms']),
    },
};
</script>
