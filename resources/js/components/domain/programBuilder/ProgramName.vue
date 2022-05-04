<template>
    <RouterLink
        v-if="workoutProgram"
        :to="{
            name: 'ProgramBuilderPage',
            params: {
                workoutProgramUuid: workoutProgram.uuid,
            },
        }"
    >
        <span v-if="workoutProgram.name">
            {{ workoutProgram.name }}
        </span>
        <MissingValue v-else full-opacity>Unnamed program</MissingValue>
    </RouterLink>
    <MissingValue v-else>(Archived program)</MissingValue>
</template>

<script>
import MissingValue from '../../util/MissingValue';

export default {
    components: {
        MissingValue,
    },
    props: {
        workoutProgram: {
            type: [Object, undefined, null],
        },
    },
};
</script>

<style scoped></style>
