<template>
    <ProgramBuilder :workoutProgramId="workoutProgramId"></ProgramBuilder>
</template>

<script>
    import ProgramBuilder from '../domain/programBuilder/ProgramBuilder';

    export default {
        name: 'CreateWorkoutProgramPage',
        components: { ProgramBuilder },
        props: {
            workoutProgramId: {
                type: String,
                required: false,
            }
        }
    }
</script>
