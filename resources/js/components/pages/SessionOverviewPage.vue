<template>
    <SessionOverview :workoutSessionUuid="workoutSessionUuid"></SessionOverview>
</template>

<script>
    import SessionOverview from '../domain/workoutSessions/SessionOverview';

    export default {
        components: {
            SessionOverview
        },
        props: {
            workoutSessionUuid: {
                type: String,
                required: true,
            },
        }
    }
</script>

<style lang="scss">

</style>
