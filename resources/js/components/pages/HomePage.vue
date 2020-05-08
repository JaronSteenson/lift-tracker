<template>
    <VContainer fluid>
        <VRow>
            <VCol cols="12" xl="6" lg="6" md="12" sm="12">
                <WorkoutProgramList></WorkoutProgramList>
            </VCol>
        </VRow>
    </VContainer>
</template>

<script>
    import WorkoutProgramList from "../domain/WorkoutProgramList";

    export default {
        components: { WorkoutProgramList },
    }
</script>
