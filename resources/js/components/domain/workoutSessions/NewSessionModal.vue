<template>
    <v-dialog :value="programUuid" scrollable max-width="300px" @input="updateDialogValue">
        <v-card>
            <v-card-title>
                New workout session
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <template v-if="loading">
                    <VSkeletonLoader type="text@4" class="mt-1"></VSkeletonLoader>

                    <VSkeletonLoader type="text" class="mt-4" style="width: 50%"></VSkeletonLoader>
                    <VSkeletonLoader type="text" class="mt-4" style="width: 50%"></VSkeletonLoader>
                    <VSkeletonLoader type="text" class="mt-4" style="width: 50%"></VSkeletonLoader>
                </template>
                <template v-else>
                    <p>
                        Please select a routine for this workout.
                        The program you are selecting from is <strong>{{ workoutProgram.name }}</strong>.
                    </p>
                    <v-radio-group v-model="routineSelection" column>
                        <v-radio v-for="{ uuid, name } in routines" :key="uuid" :label="name" :value="uuid"/>
                    </v-radio-group>
                </template>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-btn
                    color="red"
                    text
                    @click="cancel"
                >
                    Cancel
                </v-btn>
                <VSpacer/>
                <v-btn
                    color="green"
                    text :disabled="routineSelection === null"
                    @click="cancel"
                 >
                    Choose
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
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
                workoutProgram: null,
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
