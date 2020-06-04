<template>
    <component :elevation="this.$vuetify.breakpoint.smAndDown ? 0 : 5"
               :is="this.$vuetify.breakpoint.smAndDown ? 'div' : 'VCard'"
               class="js-workout-drag-handle workout-builder-card"
               max-width="960"
               width="100%"
    >
        <VToolbar :flat="$vuetify.breakpoint.xsOnly">
            <VToolbarTitle>{{ exercise.name }} - set {{ set.position + 1 }}</VToolbarTitle>

            <VSpacer/>

            <VMenu bottom left>
                <template v-slot:activator="{ on }">
                    <VBtn icon v-on="on">
                        <VIcon>mdi-dots-vertical</VIcon>
                    </VBtn>
                </template>

                <VList>
                    <VListItem @click="skipSet">
                        <VListItemTitle>Skip set</VListItemTitle>
                    </VListItem>
                </VList>
            </VMenu>
        </VToolbar>

        <VStepper
            :value="set.position + 1"
            :vertical="false"
        >
            <VStepperHeader>
                <template v-for="(otherSet) in exercise.sessionSets">
                    <VStepperStep
                        :complete="otherSet.position < set.position"
                        :key="otherSet.uuid"
                        :step="otherSet.position + 1"
                    >
                        Set {{ otherSet.position + 1 }}
                    </VStepperStep>

                    <VDivider v-if="otherSet.position + 1 < exercise.sessionSets.length"/>
                </template>
            </VStepperHeader>
        </VStepper>

        <VCardText class="py-0">
            <VContainer class="py-0">
                <VRow>
                    <VCol class="pt-0" cols="6" md="6" sm="6">
                        <VTextField
                            autofocus
                            label="Weight (kg)"
                            type="number"
                            v-model="weight"
                        />
                    </VCol>
                    <VCol class="pt-0" cols="6" md="6" sm="6">
                        <VTextField
                            label="Reps"
                            type="number"
                            v-model="reps"
                        />
                    </VCol>
                </VRow>
                <VRow>
                    <VCol class="pt-0" cols="12" md="12" sm="12" xs="6">
                        <RestPeriodSlider :disabled="isDuringRestPeriod" v-model="restPeriod"/>
                    </VCol>
                </VRow>
                <VRow class="pt-0 mt-0">
                    <VCol class="pt-0 mt-0" cols="12">
                        <a href="#">Last weeks summary of this exercise</a>
                    </VCol>
                </VRow>
                <VRow>
                    <VCol class="pt-0" cols="12">
                        <VTextarea
                            auto-grow
                            filled
                            label="Notes"
                            v-model="exerciseNotes"
                        />
                    </VCol>
                </VRow>
                <VRow justify="space-between" v-if="isDuringRestPeriod">
                    <VCol class="pt-0" cols="6">
                        <RestPeriodTimer
                            :session-set-uuid="sessionSetUuid"
                            label="Rest period remaining"
                        />
                    </VCol>

                    <VCol class="pt-0 text-right" cols="6">
                        <VBtn
                            :width="$vuetify.breakpoint.xsOnly ?  '100%' : null"
                            @click="endRestPeriod"
                            class="mb-2"
                            color="warning"
                            small
                        >
                            <VIcon left>mdi-stop</VIcon>
                            End rest
                        </VBtn>

                        <VBtn
                            :width="$vuetify.breakpoint.xsOnly ?  '100%' : null"
                            @click="startRestPeriod"
                            class="mb-2"
                            color="success"
                            small>
                            <VIcon left>mdi-skip-forward</VIcon>
                            Skip rest
                        </VBtn>
                    </VCol>
                </VRow>
            </VContainer>

            <VCardActions class="justify-center" width="100%">
                <template v-if="!isDuringRestPeriod">
                    <VBtn class="start-rest-button" @click="startRestPeriod" color="primary" x-large>
                        <VIcon left>mdi-clock-start</VIcon>
                        Start rest period
                    </VBtn>
                </template>
            </VcardActions>
        </VCardText>
    </component>
</template>

<script>
    import {mapGetters} from "vuex";
    import RestPeriodSlider from "../RestPeriodSlider";
    import RestPeriodTimer from "../RestPeriodTimer";

    export default {
        components: {
            RestPeriodSlider,
            RestPeriodTimer,
        },
        props: {
            sessionSetUuid: {
                type: String,
                required: true,
            },
        },
        computed: {
            ...mapGetters('workoutSession', ['workoutName']),
            set() {
                return this.$store.getters['workoutSession/set'](this.sessionSetUuid);
            },
            exercise() {
                return this.$store.getters['workoutSession/exerciseBySet'](this.sessionSetUuid);
            },
            isDuringRestPeriod() {
                return this.$store.getters['workoutSession/isDuringRestPeriod'](this.sessionSetUuid);
            },
            isLastSet(set) {
                return this.$store.getters['workoutSession/isLastSet'](set);
            },
            weight: {
                get() {
                    return this.$store.getters['workoutSession/weightForCurrentSet'](this.sessionSetUuid);
                },
                set(weight) {
                    this.$store.dispatch('workoutSession/updateSetWeight', {
                        uuid: this.sessionSetUuid,
                        weight
                    })
                },
            },
            reps: {
                get() {
                    return this.$store.getters['workoutSession/repsForCurrentSet'](this.sessionSetUuid);
                },
                set(reps) {
                    this.$store.dispatch('workoutSession/updateSetReps', {
                        uuid: this.sessionSetUuid,
                        reps
                    })
                },
            },
            restPeriod: {
                get() {
                    return this.$store.getters['workoutSession/restPeriodForCurrentSet'](this.sessionSetUuid);
                },
                set(restPeriodDuration) {
                    this.$store.dispatch('workoutSession/updateSetRestPeriodDuration', {
                        uuid: this.sessionSetUuid,
                        restPeriodDuration
                    })
                },
            },
            exerciseNotes: {
                get() {
                    return this.exercise.notes;
                },
                set(notes) {
                    this.$store.dispatch('workoutSession/updateExerciseNotes', {
                        uuid: this.exercise.uuid,
                        notes
                    })
                },
            },
        },
        methods: {
            skipSet() {

            },
            startRestPeriod() {
                this.$store.dispatch('workoutSession/startRestPeriod', {
                    uuid: this.sessionSetUuid,
                })
            },
            endRestPeriod() {
                this.$store.dispatch('workoutSession/endRestPeriod', {
                    uuid: this.sessionSetUuid,
                })
            },
        }
    }
</script>

<style lang="scss" scoped>
    .v-stepper {
        box-shadow: none;
    }

    .start-rest-button {
        margin-bottom: 15px;
    }
</style>
