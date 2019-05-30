<template>
    <BootstrapCard title="Create new workout program">
        <WorkoutProgramForm v-model="workoutProgram"></WorkoutProgramForm>
    </BootstrapCard>
</template>

<script>
    import BootstrapCard from "../BootstrapCard";
    import WorkoutProgramForm from "../domain/WorkoutProgramForm";

    export default {
        name: 'CreateWorkoutProgramPage',
        components: {BootstrapCard, WorkoutProgramForm},
        data() {
            return {
                workoutProgram: {
                    name: '',
                    workoutProgramRoutines: [{}]
                },
            }
        },
    }
</script>
