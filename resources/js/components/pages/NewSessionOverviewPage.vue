<template>
    <div>
        <PageToolbar title="Session overview" :back-to="{ name: 'NewSessionRoutineSelectPage' }"/>
        <NewSessionOverview :originRoutineUuid="originRoutineUuid"></NewSessionOverview>
    </div>
</template>

<script>
    import NewSessionOverview from '../domain/workoutSessions/NewSessionOverview';
    import PageToolbar from '../layouts/PageToolbar';

    export default {
        components: {
            NewSessionOverview,
            PageToolbar,
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
