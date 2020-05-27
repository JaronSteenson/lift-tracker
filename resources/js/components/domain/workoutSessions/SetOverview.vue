<template>
    <div>
        <VToolbar :flat="!isSessionOverview">
            <VMenu bottom left>
                <template v-slot:activator="{ on }">
                    <VBtn icon v-on="on">
                        <VIcon>mdi-dots-vertical</VIcon>
                    </VBtn>
                </template>

                <VList>
                    <VListItem @click="addExercise">
                        <VListItemTitle>End workout early</VListItemTitle>
                    </VListItem>
                </VList>
            </VMenu>
        </VToolbar>
    </div>
</template>

<script>
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
    }
</script>

