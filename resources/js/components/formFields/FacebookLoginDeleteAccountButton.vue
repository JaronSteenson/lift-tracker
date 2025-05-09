<template>
    <VBtn
        :href="href"
        color="red"
        dark
        :loading="loading"
        @click="loading = true"
    >
        Yes delete my account
    </VBtn>
</template>

<script>
import { mapState } from 'vuex';

export default {
    data() {
        return {
            loading: false,
        };
    },
    computed: {
        ...mapState('app', ['facebookAppId', 'csrfToken']),
        href() {
            const baseUrl = 'https://www.facebook.com/v10.0/dialog/oauth';
            const redirectUrl = `${location.protocol}//${location.host}/facebook-login-delete-account`;

            return `${baseUrl}?&auth_type=reauthenticate&scope=email&client_id=${this.facebookAppId}&redirect_uri=${redirectUrl}&state=csrf-token=${this.csrfToken}`;
        },
    },
};
</script>
