<template>
    <VBtn elevation="1" color="red" dark @click="logout">
        Yes delete my account
    </VBtn>
</template>

<script>
import { useAppStore } from '../../stores/app';

export default {
    name: 'FacebookLoginDeleteAccountButton',
    setup() {
        const appStore = useAppStore();
        return { appStore };
    },
    data() {
        return {
            loading: false,
        };
    },
    methods: {
        async logout() {
            await this.appStore.logout();
        },
    },
};
</script>
