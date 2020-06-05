<template>
    <NewSessionOverview :originRoutineUuid="originRoutineUuid"></NewSessionOverview>
</template>

<script>
    import NewSessionOverview from '../domain/workoutSessions/NewSessionOverview';

    export default {
        components: {
            NewSessionOverview
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
