export default {
    data() {
        return {
            isEditingTitle: false,
            localState: {
                ...this.$store.getters['programBuilder/getExercise'](
                    this.exerciseUuid
                ),
            },
            numberOfSetsOptions: [
                { text: 'One', value: 1 },
                { text: 'Two', value: 2 },
                { text: 'Three', value: 3 },
                { text: 'Four', value: 4 },
                { text: 'Five', value: 5 },
                { text: 'Six', value: 6 },
                { text: 'Seven', value: 7 },
                { text: 'Eight', value: 8 },
                { text: 'Nine', value: 9 },
                { text: 'Ten', value: 10 },
            ],
        };
    },
    computed: {
        exercise: {
            get() {
                return this.$store.getters['programBuilder/getExercise'](
                    this.exerciseUuid
                );
            },
            set(newState) {
                this.$store.dispatch('programBuilder/updateExercise', {
                    exerciseUuid: this.exerciseUuid,
                    ...newState,
                });
            },
        },
        isDirty() {
            return Object.entries(this.localState).some((entry) => {
                const entryKey = entry[0];
                return this.localState[entryKey] !== this.exercise[entryKey];
            });
        },
        nameDisplay() {
            return this.localState.name || 'Unnamed exercise';
        },
    },
    methods: {
        deleteExercise() {
            return this.$store.dispatch('programBuilder/deleteExercise', {
                exerciseUuid: this.exerciseUuid,
            });
        },
    },
};
