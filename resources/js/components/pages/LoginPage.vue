<template>
    <VContainer
        fluid
        class="fill-height pa-sm-0"
    >
        <VRow
            align="center"
            justify="center"
        >
            <VCol
                cols="12"
                md="4"
                sm="8"
            >
                <VCard :class="isMobile ? 'elevation-0' : 'elevation-12'">
                    <VCardText :class="isMobile ? 'pa-0' : ''">
                        <VForm>
                            <VTextField
                                label="Login"
                                name="login"
                                prepend-icon="mdi-account-outline"
                                type="text"
                            />
                            <VTextField
                                id="password"
                                label="Password"
                                name="password"
                                prepend-icon="mdi-lock"
                                type="password"
                            />
                        </VForm>
                    </VCardText>
                    <VCard-actions>
                        <v-spacer/>
                        <v-btn color="primary">Login</v-btn>
                    </VCard-actions>
                </VCard>
            </VCol>
        </VRow>
    </VContainer>
</template>

<script>
    import WorkoutProgramList from "../domain/WorkoutProgramList";

    export default {
        components: {
            WorkoutProgramList
        },
        computed: {
            isMobile() {
                return  this.$vuetify.breakpoint.name === 'xs';
            }
        },
    }
</script>
