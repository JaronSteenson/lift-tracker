<template>
    <VContainer fluid>
        <VRow>
            <VCol cols="12" xl="6" lg="6" md="12" sm="12">
                <WorkoutSessionList/>
            </VCol>
            <VCol cols="12" xl="6" lg="6" md="12" sm="12">
                <WorkoutProgramList/>
            </VCol>
        </VRow>
    </VContainer>
</template>

<script>
    import WorkoutProgramList from "../domain/WorkoutProgramList";
    import WorkoutSessionList from "../domain/WorkoutSessionList";

    export default {
        components: {WorkoutSessionList, WorkoutProgramList },
    }
</script>
