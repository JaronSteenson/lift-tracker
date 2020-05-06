<template>
    <VContainer fluid>
        <VRow>
            <VCol cols="12" xl="3" lg="4" md="6" sm="12">
                <WorkoutProgramList></WorkoutProgramList>
            </VCol>
        </VRow>
    </VContainer>
</template>

<script>
    import WorkoutProgramList from "../domain/WorkoutProgramList";

    export default {
        name: 'HomePage',
        components: { WorkoutProgramList },
    }
</script>
