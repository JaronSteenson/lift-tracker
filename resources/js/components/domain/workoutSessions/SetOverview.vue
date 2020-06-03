<template>
    <component :elevation="this.$vuetify.breakpoint.smAndDown ? 0 : 5"
               :is="this.$vuetify.breakpoint.smAndDown ? 'div' : 'VCard'"
               class="js-workout-drag-handle workout-builder-card"
               max-width="960"
               width="100%"
    >
        <VToolbar :flat="$vuetify.breakpoint.smAndDown">
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
            :vertical="false"
            :value="set.position + 1"
        >
            <VStepperHeader>
                <template v-for="(otherSet) in exercise.sessionSets">
                    <VStepperStep
                        :key="otherSet.uuid"
                        :complete="otherSet.position < set.position"
                        :step="otherSet.position + 1"
                    >
                        Set {{ otherSet.position + 1 }}
                    </VStepperStep>

                    <VDivider v-if="otherSet.position + 1 < exercise.sessionSets.length"/>
                </template>
            </VStepperHeader>
        </VStepper>

        <VCardText class="pt-0">
            <VContainer class="pt-0">
                <VRow>
                    <VCol class="pt-0" cols="12" md="6" sm="6">
                        <VTextField
                            v-model="weight"
                            autofocus
                            label="Weight (kg)"
                            type="number"
                        />
                    </VCol>
                </VRow>
                <VRow>
                    <VCol class="pt-0" cols="12" md="12" sm="12" xs="6">
                        <RestPeriodSlider v-model="restPeriod"/>
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
                            v-model="exerciseNotes"
                            filled
                            label="Notes"
                            auto-grow
                        />
                    </VCol>
                </VRow>
            </VContainer>

            <VCardActions class="justify-center" width="100%">
                <VBtn @click="startRestPeriod" color="primary" x-large width="80%">
                    <VIcon left>mdi-clock-start</VIcon>
                    Start rest period
                </VBtn>
            </VcardActions>
        </VCardText>
    </component>
</template>

<script>
    import {mapGetters} from "vuex";
    import RestPeriodSlider from "../RestPeriodSlider";

    export default {
        components: {
            RestPeriodSlider
        },
        props: {
            sessionSetUuid: {
                type: String,
                required: true,
            },
        },
        data() {
            return {}
        },
        computed: {
            ...mapGetters('workoutSession', ['workoutName']),
            set() {
                return this.$store.getters['workoutSession/set'](this.sessionSetUuid);
            },
            exercise() {
                return this.$store.getters['workoutSession/exerciseBySet'](this.sessionSetUuid);
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
            restPeriod: {
                set() {
                    this.set.restPeriod;
                },
                get() {

                }
            },
            exerciseNotes: {
                set() {
                    return this.exercise.notes;
                },
                get() {

                }
            },
        },
        methods: {
            skipSet() {

            },
            startRestPeriod() {

            },
        }
    }
</script>

<style lang="scss" scoped>
    .v-stepper{
        box-shadow: none;
    }
</style>
