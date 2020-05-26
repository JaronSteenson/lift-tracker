<template>
    <VDialog :value="programUuid" :persistent="starting" scrollable max-width="300px" @input="updateDialogValue">
        <VCard>
            <VCardTitle>
                New workout session
            </VCardTitle>
            <VDivider></VDivider>
            <VCardText>
                <template v-if="loading">
                    <VSkeletonLoader type="text@4" class="mt-1"></VSkeletonLoader>

                    <VSkeletonLoader type="text" class="mt-4" style="width: 50%"></VSkeletonLoader>
                    <VSkeletonLoader type="text" class="mt-4" style="width: 50%"></VSkeletonLoader>
                    <VSkeletonLoader type="text" class="mt-4" style="width: 50%"></VSkeletonLoader>
                </template>
                <template v-else>
                    <p>
                        Please select a routine for this workout.
                        You are selecting from your <strong>{{ workoutProgram.name }}</strong> program.
                    </p>
                    <VRadioGroup v-model="routineSelection" :disabled="starting" column>
                        <VRadio v-for="{ uuid, name } in routines" :key="uuid" :label="name" :value="uuid"/>
                    </VRadioGroup>
                </template>
            </VCardText>
            <VDivider/>
            <VCardActions>
                <VBtn
                    color="red"
                    text
                    :disabled="starting"
                    @click="cancel"
                >
                    Cancel
                </VBtn>
                <VSpacer/>
                <VBtn
                    color="green"
                    text :disabled="routineSelection === null"
                    :loading="starting"
                    @click="start"
                 >
                    Choose
                </VBtn>
            </VCardActions>
        </VCard>
    </VDialog>
</template>

<script>
    import WorkoutProgramService from "../../../api/WorkoutProgramService";

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
            }
        },
        watch: {
            programUuid: {
                deep: true,
                async handler(newValue) {
                    if (newValue !== null) {
                        this.loading = true;
                        const response = await WorkoutProgramService.get(this.programUuid);
                        this.workoutProgram = response.data;
                        this.loading = false;
                    }
                }
            }
        },
        computed: {
            routines() {
                return this.workoutProgram.workoutProgramRoutines;
            }
        },
        methods: {
            async start() {
                try {
                    this.starting = true;
                    await this.$store.dispatch('programBuilder/fetch', this.workoutProgramUuid)
                    await this.$router.push({ name: 'newSessionOverview', params: { originRoutineUuid: this.routineSelection } });
                    this.starting = false;
                } catch (e) {
                    this.fetchError = true;
                }
            },
            updateDialogValue(value) {
                if (value === false) {
                    this.cancel();
                }
            },
            cancel() {
                this.$emit('update:programUuid', null)
                this.routineSelection = null;
            }
        }
    }
</script>

<style lang="scss">
    .v-card__title {
        word-break: break-word;
    }
</style>
