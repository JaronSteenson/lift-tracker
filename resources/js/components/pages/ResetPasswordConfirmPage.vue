<template>
    <div>
        <AppBar />
        <div class="d-flex flex-wrap justify-center mt-16">
            <VAlert v-if="passwordIsReset" type="success">
                <p>You are all set, your password has been reset!</p>
                <RouterLink
                    class="small-login-page-link pa-2 d-block"
                    :to="{ name: 'HomePage' }"
                >
                    Go to home page
                </RouterLink>
            </VAlert>
            <VForm v-else @submit.prevent="tryResetPassword">
                <VTextField
                    disabled
                    :dark="!authenticatedUser || $vuetify.theme.dark"
                    label="Email"
                    :value="email"
                    type="text"
                />
                <VTextField
                    :dark="!authenticatedUser || $vuetify.theme.dark"
                    label="New password"
                    v-model="password"
                    type="password"
                />
                <div
                    v-if="didSubmit && password !== passwordConfirm"
                    class="login-error"
                >
                    Passwords must match.
                </div>
                <VTextField
                    :dark="!authenticatedUser || $vuetify.theme.dark"
                    label="Confirm new password"
                    v-model="passwordConfirm"
                    type="password"
                />
                <div v-if="serverError" class="login-error">
                    {{ serverError }}
                </div>
                <VBtn
                    color="primary"
                    width="100%"
                    type="submit"
                    :loading="loading"
                >
                    Reset password
                </VBtn>
                <template v-if="!authenticatedUser">
                    <hr class="form mt-4 mb-4" />
                    <div class="d-flex justify-space-around">
                        <RouterLink
                            class="small-login-page-link pa-2 d-block"
                            :to="authenticatedUser ? '/' : 'login'"
                        >
                            {{
                                authenticatedUser
                                    ? 'Back to home'
                                    : 'Back to login'
                            }}
                        </RouterLink>
                    </div>
                </template>
            </VForm>
        </div>
    </div>
</template>

<script>
import AppBar from '../AppBar';
import { mapState } from 'vuex';

export default {
    components: { AppBar },
    data() {
        return {
            value: {
                email: this.$route.query.email,
                token: this.$route.query.token,
                password: '',
                passwordConfirm: '',
            },
            loading: false,
            didSubmit: false,
            passwordIsReset: false,
            serverError: null,
        };
    },
    computed: {
        ...mapState('app', ['authenticatedUser']),
        email: {
            get() {
                return this.value.email;
            },
            set(email) {
                this.value = { ...this.value, email };
            },
        },
        password: {
            get() {
                return this.value.password;
            },
            set(password) {
                this.value = { ...this.value, password };
            },
        },
        passwordConfirm: {
            get() {
                return this.value.passwordConfirm;
            },
            set(passwordConfirm) {
                this.value = { ...this.value, passwordConfirm };
            },
        },
    },
    methods: {
        async tryResetPassword() {
            this.didSubmit = true;
            if (this.password !== this.passwordConfirm) {
                return;
            }

            this.loading = true;
            const response = await this.$store.dispatch(
                'app/resetPassword',
                this.value
            );

            if (response.status >= 400 && response.status < 500) {
                this.loading = false;
                this.serverError = response.data?.errors?.password[0] ?? '';
                return;
            }

            this.loading = false;
            this.passwordIsReset = true;
        },
    },
};
</script>
