<template>
    <BootstrapCard>
        <template v-slot:header>
            <div class="d-flex justify-content-center">
                <title-input class="workout-name" :placeholder="'Enter workout name'" :initial-value="getName()" @input="updateRoutineName"></title-input>

                <div class="dropdown">
                    <button class="btn btn-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    </button>
                    <div class="dropdown-menu dropdown-menu-right">
                        <a class="dropdown-item" href="#">Delete</a>
                    </div>
                </div>
            </div>
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
    .workout-name {
        /* 40px for some space for the drop down menu button. */
        min-width: calc(90% - 40px);
        max-width: calc(90% - 40px);
        width: calc(90% - 40px);
        margin-right: 40px;
    }

    .dropdown {
        position: absolute;
        right: 0;
        top: 0;
    }
</style>
