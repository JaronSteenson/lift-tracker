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
import { useProgramBuilderStore } from '../../stores/programBuilder';

export default {
    name: 'StartRoutineSelectionList',
    components: {
        NarrowContentContainer,
        RoutineCard,
    },
    setup() {
        const programBuilderStore = useProgramBuilderStore();
        return { programBuilderStore };
    },
    computed: {
        myWorkoutProgramsIsLoading() {
            return this.programBuilderStore.myWorkoutProgramsIsLoading;
        },
        myRoutines() {
            // Return workout routines from all programs for session selection
            const routines = [];
            this.programBuilderStore.myWorkoutPrograms.forEach((program) => {
                if (
                    program.workoutProgramRoutines &&
                    Array.isArray(program.workoutProgramRoutines)
                ) {
                    program.workoutProgramRoutines.forEach((routine) => {
                        routines.push({
                            ...routine,
                            workoutProgram: {
                                uuid: program.uuid,
                                name: program.name,
                                createdAt: program.createdAt,
                                updatedAt: program.updatedAt,
                            },
                        });
                    });
                }
            });
            return routines;
        },
    },
};
</script>
