<template>
    <BootstrapCard>
        <template v-slot:header>
            <title-input class="title-input" :placeholder="'Enter workout name'" :initial-value="getName()" @input="updateRoutineName"></title-input>
        </template>

        Things go here

    </BootstrapCard>
</template>

<script>
    import { mapState } from 'vuex';
    import TitleInput from "../../formFields/TitleInput";
    import BootstrapCard from "../../BootstrapCard";

    export default {
        name: "RoutineCard",
        components: { TitleInput, BootstrapCard },
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
    .title-input {
        width: 100%;
    }
</style>
