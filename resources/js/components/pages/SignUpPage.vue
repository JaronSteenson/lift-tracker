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
                <VCard :class="$vuetify.breakpoint.xs ? 'elevation-0 login-card--flat' : 'elevation-12'" :loading="!$vuetify.breakpoint.xs && loading">
                    <VCardText :class="{ 'pa-0': this.$vuetify.breakpoint.xs }">
                        <VCardTitle>New account sign-up
                            <VSpacer/>
                            <VSubheader>
                                <RouterLink :to="{ name: 'login', params: { initialEmail: email, initialPassword: password } }">
                                    Already have an account?
                                </RouterLink>
                            </VSubheader>
                        </VCardTitle>

                        <VForm
                            v-model="valid"
                        >
                            <VTextField
                                v-model.lazy="name"
                                autofocus
                                :rules="nameRules"
                                label="Name"
                                name="name"
                                prepend-icon="mdi-account-outline"
                                type="text"
                                validate-on-blur
                                @keydown.enter="login"
                            />
                            <VTextField
                                v-model.lazy="email"
                                :rules="emailRules"
                                label="Email"
                                name="email"
                                prepend-icon="mdi-email-outline"
                                type="text"
                                validate-on-blur
                                @keydown.enter="login"
                            />
                            <VTextField
                                v-model.lazy="password"
                                :rules="passwordRules"
                                label="Password"
                                name="password"
                                prepend-icon="mdi-lock"
                                type="password"
                                validate-on-blur
                                @keydown.enter="login"
                            />
                            <VTextField
                                v-model.lazy="confirmPassword"
                                :rules="[passwordConfirmationRule]"
                                label="Confirm password"
                                name="confirm-password"
                                prepend-icon="mdi-repeat"
                                type="password"
                                @keydown.enter="login"
                            />
                        </VForm>
                    </VCardText>
                    <VCard-actions>
                        <VSpacer/>
                        <v-btn color="primary" :disabled="!valid" :loading="loading" @click="login" >Sign up</v-btn>
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
                loading: false,
                name: null,
                email: this.initialEmail || null,
                password: this.initialPassword || null,
                confirmPassword: null,
                nameRules: [
                    v => !!v || 'Name is required',
                ],
                emailRules: [
                    v => !!v || 'E-mail is required',
                    v => /.+@.+\..+/.test(v) || 'E-mail must be valid',
                ],
                passwordRules: [
                    v => !!v || 'Password is required',
                ],
                valid: false,
                failedSignUp: false,
            }
        },
        computed: {
            passwordConfirmationRule() {
                return () => (this.password === this.confirmPassword) || 'Passwords must match'
            },
        },
        methods: {
            async login() {
                if (!this.valid) {
                    return;
                }

                this.loading = true;
                const success = await this.$store.dispatch('app/signUp', {
                    name: this.name,
                    email: this.email,
                    password: this.password
                })

                debugger;
                if (success) {
                    const afterLoginRoute = this.$store.getters['app/afterLoginRoute'];
                    this.$router.replace(afterLoginRoute);
                    return;
                }

                this.failedSignUp = true;
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
