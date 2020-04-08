<template>
    <VCard outlined class="exercise-card js-exercise-drag-handle drag-handle">
        <VCardTitle>
            <VTextField placeholder="Enter exercise name" v-model="name" :autofocus="autofocus"/>

            <v-menu bottom left>
                <template v-slot:activator="{ on }">
                    <VBtn
                        icon
                        v-on="on"
                    >
                        <v-icon>mdi-dots-vertical</v-icon>
                    </VBtn>
                </template>

                <v-list>
                    <v-list-item @click="deleteExercise">
                        <v-list-item-title>Delete this exercise</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
        </VCardTitle>
    </VCard>
</template>
<script>
    export default {
        props: {
            exerciseUuid: {
                type: String,
                required: true,
            }
        },
        computed: {
            autofocus() {
                if (this.$store.getters['programBuilder/wasjustAddedModel'](this.exerciseUuid)) {
                    this.$nextTick(() => {
                        this.$store.dispatch('programBuilder/clearjustAddedModel');
                    });
                    return true;
                }
                return false;
            },
            exercise: {
                get() {
                    return this.$store.getters['programBuilder/getExercise'](this.exerciseUuid);
                }
            },
            name: {
                get() {
                    return this.exercise.name || '';
                },
                set(name) {
                    this.$store.dispatch('programBuilder/updateExercise', { exerciseUuid: this.exerciseUuid, name });
                }
            },
            numberOfSets: {
                get() {
                    return this.numberOr(this.exercise.numberOfSets, '');
                },
                set(numberOfSets) {
                    numberOfSets = this.numberOr(numberOfSets, null);
                    this.$store.dispatch('programBuilder/updateExercise', { exerciseUuid: this.exerciseUuid, numberOfSets });
                }
            },
        },
        methods: {
            getExercise() {
                return this.$store.getters['programBuilder/getExercise'](this.exerciseUuid);
            },
            deleteExercise() {
                return this.$store.dispatch('programBuilder/deleteExercise', { exerciseUuid: this.exerciseUuid });
            },
            numberOr(value, fallBackValue) {
                const potentialNumber = Number.parseInt(value);

                return Number.isNaN(potentialNumber) ? fallBackValue : potentialNumber;
            },
        }
    }
</script>

<style lang="scss" scoped>
    .exercise-card {
        margin: 2%;
    }
</style>
