<template>
    <div>
        <VSkeletonLoader
            v-if="myWorkoutProgramsIsLoading"
            class="ma-5"
            type="card@10"
        />
        <NarrowContentContainer v-else>
            <RoutineCard
                v-for="routine in myRoutines"
                :key="routine.uuid"
                :routine="routine"
            />
        </NarrowContentContainer>
    </div>
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
