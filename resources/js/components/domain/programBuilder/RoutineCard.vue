<template>
    <div class="routine-card">
        <title-input :value="name" @input="updateRoutineName"></title-input>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import TitleInput from "../../formFields/TitleInput";

    export default {
        name: "RoutineCard",
        components: { TitleInput },
        created() {
            // this.$store.dispatch('programBuilder/startNew');
        },
        props: {
            position: {
                type: Number,
                required: true,
            }
        },
        computed: mapState('programBuilder', {
            routine: state => state.getRoutineByPosition(position),
        }),
        methods: {
            updateRoutineName() {

            }
        }
    }
</script>

<style scoped>
    .routine-card {
        width: 300px;
        min-height: 300px;
        border: solid 3px #524f52;
    }
</style>
