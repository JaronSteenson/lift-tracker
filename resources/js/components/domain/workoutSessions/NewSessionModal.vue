<template>
    <VDialog
        :value="programUuid"
        scrollable
        max-width="300px"
        @input="updateDialogValue"
    >
        <VCard :loading="starting">
            <VCardTitle>
                <VSkeletonLoader
                    v-if="loading"
                    type="heading"
                    class="mt-2"
                    style="width: 50%"
                />
                <template v-else>
                    {{ workoutProgram.name || 'Unnamed program' }}
                </template>
            </VCardTitle>
            <VDivider />
            <VCardText>
                <template v-if="loading">
                    <VSkeletonLoader
                        type="text"
                        class="mt-4"
                        style="width: 50%"
                    />
                    <VSkeletonLoader
                        type="text"
                        class="mt-4"
                        style="width: 50%"
                    />
                    <VSkeletonLoader
                        type="text"
                        class="mt-4"
                        style="width: 50%"
                    />
                </template>
                <template v-else>
                    Chose a routine to start now
                    <VRadioGroup
                        v-model="routineSelection"
                        :disabled="starting"
                        column
                    >
                        <VRadio
                            v-for="{ uuid, name } in routines"
                            :key="uuid"
                            :label="name"
                            :value="uuid"
                        />
                    </VRadioGroup>
                </template>
            </VCardText>
            <VDivider />
            <VCardActions>
                <VBtn color="red" text :disabled="starting" @click="cancel">
                    Cancel
                </VBtn>
                <VSpacer />
                <VBtn
                    color="green"
                    text
                    :loading="starting"
                    :disabled="routineSelection === null"
                    :to="{
                        name: 'NewSessionOverviewPage',
                        params: { originRoutineUuid: this.routineSelection },
                    }"
                    @click="starting = true"
                >
                    Start
                </VBtn>
            </VCardActions>
        </VCard>
    </VDialog>
</template>

<script>
import WorkoutProgramService from '../../../api/WorkoutProgramService';
import { mapGetters } from 'vuex';

export default {
    props: {
        programUuid: String,
    },
    data() {
        return {
            routineSelection: null,
            loading: true,
            starting: false,
            workoutProgram: null,
            fetchError: null,
        };
    },
    watch: {
        programUuid: {
            deep: true,
            async handler(newValue) {
                if (newValue !== null) {
                    if (this.userIsLocalOnly) {
                        this.workoutProgram = this.myWorkoutPrograms.find(
                            ({ uuid }) => uuid === this.programUuid
                        );
                        this.loading = false;
                        return;
                    }

                    this.loading = true;
                    const response = await WorkoutProgramService.get(
                        this.programUuid
                    );
                    this.workoutProgram = response.data;
                    this.loading = false;
                }
            },
        },
    },
    computed: {
        ...mapGetters('app', ['userIsLocalOnly']),
        ...mapGetters('programBuilder', ['myWorkoutPrograms']),
        routines() {
            if (!this.workoutProgram) {
                return [];
            }

            return this.workoutProgram.workoutProgramRoutines;
        },
    },
    methods: {
        updateDialogValue(value) {
            if (value === false) {
                this.cancel();
            }
        },
        cancel() {
            this.$emit('update:programUuid', null);
            this.routineSelection = null;
        },
    },
};
</script>

<style lang="scss">
.v-card__title {
    word-break: break-word;
}
</style>
