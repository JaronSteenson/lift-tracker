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

        <VStepper :vertical="false" :value="set.position + 1">
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

        <VCardText>
            <VContainer>
                <VRow>
                    <VCol cols="12" md="6" sm="6">
                        <VTextField
                            label="Weight (kg)"
                            type="number"
                            v-model="weight"
                        />
                    </VCol>
                </VRow>
                <VRow>
                    <VCol cols="12" md="6" sm="6">
                        <VTextarea
                            label="Exercise notes"
                            v-model="exerciseNotes"
                        />
                    </VCol>
                </VRow>
                <VRow>
                    <VCol cols="12" md="6" sm="6">
                        <RestPeriodSlider v-model="restPeriod"/>
                    </VCol>
                </VRow>
            </VContainer>
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
                set() {

                },
                get() {

                }
            },
            exerciseNotes: {
                set() {

                },
                get() {

                }
            },
            restPeriod: {
                set() {

                },
                get() {

                }
            }
        },
        methods: {
            skipSet() {

            }
        }
    }
</script>

