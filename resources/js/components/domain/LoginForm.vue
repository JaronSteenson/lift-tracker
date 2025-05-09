<template>
    <VForm @submit.prevent="tryLogin">
        <VTextField dark label="Email" v-model="email" type="text" />
        <VTextField dark label="Password" v-model="password" type="password" />
        <div v-if="serverError" class="login-error">{{ serverError }}</div>
        <VBtn
            color="white"
            outlined
            width="100%"
            type="submit"
            :loading="loading"
        >
            Go
        </VBtn>
    </VForm>
</template>

<script>
export default {
    props: {
        value: {
            type: Object,
            required: false,
            default() {
                return {
                    email: '',
                    password: '',
                };
            },
        },
    },
    data() {
        return {
            loading: false,
            serverError: null,
        };
    },
    computed: {
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
    },
    methods: {
        async tryLogin() {
            this.loading = true;
            const response = await this.$store.dispatch(
                'app/login',
                this.value
            );

            if (response.status >= 400 && response.status < 500) {
                this.loading = false;
                if (response.data?.errors?.email) {
                    this.serverError = response.data?.errors?.email[0];
                } else if (response.data?.message) {
                    this.serverError = response.data?.message;
                } else {
                    this.serverError = 'Incorrect login provided.';
                }
                return;
            }

            const pathname = this.$store.getters['app/afterLoginUrl'];
            await this.$router.push(pathname);

            this.loading = false;
        },
    },
};
</script>
