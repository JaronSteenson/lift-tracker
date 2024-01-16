<template>
    <div>
        <AppBar />
        <div class="d-flex flex-wrap justify-center mt-16">
            <template v-if="emailSent">
                <VAlert type="success">
                    <p>A password reset email has been sent to {{ email }}</p>
                    <RouterLink
                        class="small-login-page-link pa-2 d-block"
                        :to="authenticatedUser ? '/' : 'login'"
                    >
                        {{
                            authenticatedUser ? 'Back to home' : 'Back to login'
                        }}
                    </RouterLink>
                </VAlert>
            </template>
            <VForm v-else @submit.prevent="trySendEmail">
                <VTextField
                    :dark="!authenticatedUser || $vuetify.theme.dark"
                    :disabled="Boolean(authenticatedUser)"
                    label="Email"
                    v-model="email"
                    type="text"
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
                    Send password reset email
                </VBtn>
                <template v-if="!authenticatedUser">
                    <hr class="form mt-4 mb-4" />
                    <div class="d-flex justify-space-around">
                        <RouterLink
                            class="small-login-page-link pa-2 d-block"
                            to="login"
                        >
                            Back to login
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
        const authenticatedUser = this.$store.state.app.authenticatedUser;
        return {
            email: authenticatedUser?.email || this.$route.query.email,
            loading: false,
            emailSent: false,
            serverError: null,
        };
    },
    computed: {
        ...mapState('app', ['authenticatedUser']),
    },
    methods: {
        async trySendEmail() {
            this.loading = true;
            const response = await this.$store.dispatch(
                'app/sendPasswordResetEmail',
                this.email
            );

            if (response.status >= 400 && response.status < 500) {
                this.loading = false;
                this.serverError = response.data?.errors?.email[0] ?? '';
                return;
            }

            this.loading = false;
            this.emailSent = true;
        },
    },
};
</script>
