<template>
    <div>
        <template v-if="emailVerificationEmailSent">
            <VAlert class="mt-4" type="success">
                A verification email has been sent to {{ value.email }}
            </VAlert>
            <VBtn
                dark
                text
                small
                width="100%"
                :disabled="loading"
                @click="$emit('showLoginForm')"
            >
                Back to login
            </VBtn>
        </template>
        <VForm v-else @submit.prevent="tryRegister">
            <VTextField
                dark
                label="First name"
                v-model="firstName"
                type="text"
            />
            <div
                v-for="error in serverErrors.firstName"
                :key="error"
                class="login-error"
            >
                {{ error }}
            </div>
            <VTextField dark label="Last name" v-model="lastName" type="text" />
            <div
                v-for="error in serverErrors.lastName"
                :key="error"
                class="login-error"
            >
                {{ error }}
            </div>
            <VTextField dark label="Email" v-model="email" type="text" />
            <div
                v-for="error in serverErrors.email"
                :key="error"
                class="login-error"
            >
                {{ error }}
            </div>
            <VTextField
                dark
                label="Password"
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
                dark
                label="Confirm password"
                v-model="passwordConfirm"
                type="password"
            />
            <VBtn color="primary" width="100%" type="submit" :loading="loading">
                Register
            </VBtn>
            <hr class="mt-4 mb-4" />
            <VBtn
                dark
                text
                small
                width="100%"
                :disabled="loading"
                @click="$emit('showLoginForm')"
            >
                {{
                    $vuetify.breakpoint.smAndUp
                        ? 'Already a member? Log in instead'
                        : 'Log in instead'
                }}
            </VBtn>
        </VForm>
    </div>
</template>

<script>
export default {
    props: {
        value: {
            type: Object,
            required: false,
            default() {
                return {
                    firstName: '',
                    lastName: '',
                    email: '',
                    password: '',
                    passwordConfirm: '',
                };
            },
        },
    },
    data() {
        return {
            loading: false,
            didSubmit: false,
            emailVerificationEmailSent: false,
            serverErrors: {
                firstName: [],
                lastName: [],
                email: [],
                password: [],
            },
        };
    },
    computed: {
        firstName: {
            get() {
                return this.value.firstName;
            },
            set(firstName) {
                this.$emit('input', { ...this.value, firstName });
            },
        },
        lastName: {
            get() {
                return this.value.lastName;
            },
            set(lastName) {
                this.$emit('input', { ...this.value, lastName });
            },
        },
        email: {
            get() {
                return this.value.email;
            },
            set(email) {
                this.$emit('input', { ...this.value, email });
            },
        },
        password: {
            get() {
                return this.value.password;
            },
            set(password) {
                this.$emit('input', { ...this.value, password });
            },
        },
        passwordConfirm: {
            get() {
                return this.value.passwordConfirm;
            },
            set(passwordConfirm) {
                this.$emit('input', { ...this.value, passwordConfirm });
            },
        },
    },
    methods: {
        async tryRegister() {
            this.didSubmit = true;
            if (this.password !== this.passwordConfirm) {
                return;
            }

            this.loading = true;
            const response = await this.$store.dispatch(
                'app/register',
                this.value
            );

            if (response.status >= 400 && response.status < 500) {
                this.loading = false;
                this.serverErrors = response.data.errors;
                return;
            }

            this.emailVerificationEmailSent = true;
            this.loading = false;
        },
    },
};
</script>
