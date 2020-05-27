<template>
    <div>
        <VToolbar :flat="$vuetify.breakpoint.smAndDown">
            <VToolbarTitle>{{ workoutName }}</VToolbarTitle>

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
    </div>
</template>

<script>
    import {mapGetters} from "vuex";

    export default {
        components: {

        },
        props: {
            sessionSetUuid: {
                type: String,
                required: true,
            },
        },
        data() {
            return {
            }
        },
        computed: {
            ...mapGetters('workoutSession', ['workoutName'])
        },
        methods: {
            skipSet() {

            }
        }
    }
</script>

