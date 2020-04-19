<template>
    <VContainer
        fluid
        class="fill-height"
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
                <VCard :class="xs ? 'elevation-0' : 'elevation-12'" :loading="!xs && loading">
                    <VCardText :class="{ 'pa-0': xs }">
                        <VAlert v-if="failedLogin" type="error">
                            Your email and/or password do not match.
                        </VAlert>
                        <VSubheader v-else>
                            Please login to continue.
                        </VSubheader>

                        <VForm
                            v-model="valid"
                        >
                            <VTextField
                                v-model.lazy="email"
                                :rules="emailRules"
                                label="Email"
                                name="email"
                                prepend-icon="mdi-account-outline"
                                type="text"
                                validate-on-blur
                            />
                            <VTextField
                                v-model="password"
                                :rules="passwordRules"
                                label="Password"
                                name="password"
                                prepend-icon="mdi-lock"
                                type="password"
                                @keydown.enter="login"
                            />
                        </VForm>
                    </VCardText>
                    <VCard-actions>
                        <v-spacer/>
                        <v-btn color="primary" :disabled="!valid" :loading="loading" @click="login" >Login</v-btn>
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
        data() {
            return {
                loading: false,
                email: null,
                password: null,
                emailRules: [
                    v => !!v || 'E-mail is required',
                    v => /.+@.+\..+/.test(v) || 'E-mail must be valid',
                ],
                passwordRules: [
                    v => !!v || 'Password is required',
                ],
                valid: false,
                failedLogin: false,
            }
        },
        computed: {
            xs() {
                return  this.$vuetify.breakpoint.name === 'xs';
            }
        },
        methods: {
            async login() {
                if (!this.valid) {
                    return;
                }

                this.loading = true;
                const success = await this.$store.dispatch('app/login', {
                    email: this.email,
                    password: this.password
                })

                if (success) {
                    const afterLoginRoute = this.$store.getters['app/afterLoginRoute'];
                    this.$router.replace(afterLoginRoute);
                    return;
                }

                this.failedLogin = true;
                this.loading = false;
            }
        }
    }
</script>
