<template>
    <SessionOverview :originProgramUuid="originProgramUuid" :originRoutineUuid="originRoutineUuid"></SessionOverview>
</template>

<script>
    import SessionOverview from '../domain/workoutSessions/SessionOverview';

    export default {
        components: {
            SessionOverview
        },
        props: {
            originProgramUuid: {
                type: String,
                required: true,
            },
            originRoutineUuid: {
                type: String,
                required: true,
            },
        }
    }
</script>

<style lang="scss">

</style>
