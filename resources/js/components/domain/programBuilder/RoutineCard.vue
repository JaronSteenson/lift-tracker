<template>
    <div class="routine-card d-flex justify-content-center">
        <title-input :placeholder="'Enter workout name'" :initial-value="getName()" @input="updateRoutineName"></title-input>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import TitleInput from "../../formFields/TitleInput";

    export default {
        name: "RoutineCard",
        components: { TitleInput },
        props: {
            position: {
                type: Number,
                required: true,
            }
        },
        methods: {
            getName() {
              return this.getRoutineByPosition().name;
            },
            getRoutineByPosition() {
                return this.$store.getters['programBuilder/getRoutineByPosition'](this.position);
            },
            updateRoutineName(e) {
                this.$store.dispatch('programBuilder/updateRoutineName', { position: this.position, name:  e.target.value });
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
