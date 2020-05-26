<template>
    <SessionOverview :originRoutineUuid="originRoutineUuid"></SessionOverview>
</template>

<script>
    import SessionOverview from '../domain/workoutSessions/SessionOverview';

    export default {
        components: {
            SessionOverview
        },
        props: {
            originRoutineUuid: {
                type: String,
                required: true,
            },
        }
    }
</script>

<style lang="scss">

</style>
