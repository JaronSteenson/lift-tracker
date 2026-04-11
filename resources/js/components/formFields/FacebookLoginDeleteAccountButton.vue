<template>
    <VBtn elevation="1" color="red" dark @click="logout">
        Yes delete my account
    </VBtn>
</template>

<script>
import { useAuth } from '../domain/auth/composables/useAuth';

export default {
    name: 'FacebookLoginDeleteAccountButton',
    setup() {
        const { logout: performLogout } = useAuth();
        return { performLogout };
    },
    data() {
        return {
            loading: false,
        };
    },
    methods: {
        async logout() {
            await this.performLogout();
        },
    },
};
</script>
