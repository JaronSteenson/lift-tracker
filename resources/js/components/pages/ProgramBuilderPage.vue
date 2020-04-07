<template>
    <ProgramBuilder :workoutProgramUuid="workoutProgramUuid"></ProgramBuilder>
</template>

<script>
    import ProgramBuilder from '../domain/programBuilder/ProgramBuilder';

    export default {
        components: {
            ProgramBuilder
        },
        props: {
            workoutProgramUuid: {
                type: String,
                required: false,
            }
        }
    }
</script>
