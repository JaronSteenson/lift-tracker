<template>
    <VContainer
        class="fill-height"
        fluid
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
                <VCard :class="$vuetify.breakpoint.xs ? 'elevation-0 login-card--flat' : 'elevation-12 login-card--flip'"
                       :loading="!$vuetify.breakpoint.xs && loading">
                    <VCardText :class="{ 'pa-0': this.$vuetify.breakpoint.xs }">
                        <VCardTitle>
                            Please login to continue
                            <VSpacer/>
                            <VSubheader>
                                <RouterLink
                                    :to="{ name: 'sign-up', params: { initialEmail: email, initialPassword: password } }"
                                >
                                    Sign up instead.
                                </RouterLink>
                            </VSubheader>
                        </VCardTitle>

                        <VAlert type="error" v-if="failedLogin">
                            Your email and/or password do not match.
                        </VAlert>

                        <VForm
                            v-model="valid"
                        >
                            <VTextField
                                :rules="leaving || emailRules"
                                autofocus
                                label="Email"
                                name="email"
                                autocomplete="username"
                                prepend-icon="mdi-account-outline"
                                type="text"
                                v-model.lazy="email"
                                @keydown.enter="login"
                            />
                            <VTextField
                                :rules="leaving || passwordRules"
                                label="Password"
                                name="password"
                                autocomplete="current-password"
                                prepend-icon="mdi-lock"
                                type="password"
                                v-model="password"
                                @keydown.enter="login"
                            />
                        </VForm>
                    </VCardText>
                    <VCard-actions>
                        <VSpacer/>
                        <v-btn :disabled="!valid" :loading="loading" @click="login" color="primary">Login</v-btn>
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
        props: {
            initialEmail: String,
            initialPassword: String,
        },
        data() {
            return {
                leaving: false,
                loading: false,
                email: this.initialEmail,
                password: this.initialPassword,
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

<style lang="scss" scoped>
    .login-card--flat {
        border: none !important
    }
</style>
