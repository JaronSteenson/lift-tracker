<template>
    <VCard outlined class="exercise-card js-exercise-drag-handle drag-handle">
        <VCardTitle v-if="isAddingNew">
                <VTextField
                    v-model="nameEditing" :autofocus="isAddingNew"
                    label="Exercise name"
                    @blur="isAddingNew = false"
                />

<!--                <VTextField-->
<!--                    label="Number of sets"-->
<!--                    v-model.number="numberOfSets"-->
<!--                    type="number"-->
<!--                />-->

<!--                <VTextField-->
<!--                    label="Weight"-->
<!--                    v-model.number="numberOfSets"-->
<!--                    type="number"-->
<!--                />-->
        </VCardTitle>
        <template v-else>
            <VCardTitle>
                <EditableTitle @click="isAddingNew = true">{{ nameDisplay }}</EditableTitle>
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
                        <v-list-item @click="isAddingNew = true">
                            <v-list-item-title>Edit</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="deleteExercise">
                            <v-list-item-title>Delete</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </VCardTitle>
        </template>
    </VCard>
</template>
<script>
    import EditableTitle from "../../formFields/EditableTitle";
    export default {
        components: { EditableTitle },
        props: {
            exerciseUuid: {
                type: String,
                required: true,
            }
        },
        data() {
            return {
                isAddingNew: false,
            }
        },
        mounted() {
            if (this.$store.getters['programBuilder/isJustAddedModelUuid'](this.exerciseUuid)) {
                this.isAddingNew = true;

                this.$nextTick(() => {
                    this.$store.dispatch('programBuilder/forgetJustAddedUuid');
                });
            }
        },
        computed: {
            exercise: {
                get() {
                    return this.$store.getters['programBuilder/getExercise'](this.exerciseUuid);
                }
            },
            nameEditing: {
                get() {
                    return this.exercise.name || '';
                },
                set(name) {
                    this.$store.dispatch('programBuilder/updateExercise', { exerciseUuid: this.exerciseUuid, name });
                }
            },
            nameDisplay() {
                return this.$store.getters['programBuilder/getExerciseNameForDisplay'](this.exerciseUuid);
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
