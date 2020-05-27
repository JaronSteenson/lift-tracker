<template>
<!--    <SessionOverview :workoutSessionUuid="workoutSessionUuid"></SessionOverview>-->
    <h1>Will be an existing/past session overview uuid: {{workoutSessionUuid}}</h1>
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
