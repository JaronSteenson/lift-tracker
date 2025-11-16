<template>
    <RouterLink
        v-if="workoutProgram"
        :to="{
            name: 'ProgramBuilderPage',
            params: {
                workoutProgramUuid: workoutProgram.uuid,
            },
            query:
                $route.name === 'MyWorkoutProgramsPage'
                    ? undefined
                    : {
                          returnTo: $route.path,
                      },
        }"
    >
        <span v-if="workoutProgram?.name">
            {{ workoutProgram?.name }}
        </span>
        <MissingValue v-else full-opacity>Unnamed program</MissingValue>
    </RouterLink>
</template>

<script setup>
import MissingValue from '../../util/MissingValue';

defineProps({
    workoutProgram: {
        type: [Object, undefined, null],
    },
});
</script>

<style scoped></style>
