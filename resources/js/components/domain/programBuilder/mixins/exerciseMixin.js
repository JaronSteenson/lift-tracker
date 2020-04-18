export default {
    computed: {
        exercise: {
            get() {
                return this.$store.getters['programBuilder/getExercise'](this.exerciseUuid);
            },
            set(newState) {
                this.$store.dispatch('programBuilder/updateExercise', { exerciseUuid: this.exerciseUuid, ...newState });
            },
        },
        nameEditing: {
            get() {
                return this.exercise.name || '';
            },
            set(name) {
                this.$store.dispatch('programBuilder/updateExercise', {exerciseUuid: this.exerciseUuid, name});
            }
        },
        nameDisplay() {
            return this.$store.getters['programBuilder/getExerciseNameForDisplay'](this.exerciseUuid);
        },
    },
    methods: {
        deleteExercise() {
            return this.$store.dispatch('programBuilder/deleteExercise', {exerciseUuid: this.exerciseUuid});
        },
    }
}
