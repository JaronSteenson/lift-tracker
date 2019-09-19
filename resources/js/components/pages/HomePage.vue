<template>
    <div>
        <WorkoutProgramList></WorkoutProgramList>
    </div>
</template>

<script>
    import WorkoutProgramList from "../domain/WorkoutProgramList";

    export default {
        name: 'HomePage',
        components: {WorkoutProgramList},
    }
</script>
