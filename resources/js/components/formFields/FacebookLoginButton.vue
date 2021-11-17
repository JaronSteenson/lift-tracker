<template>
    <VBtn class="facebook-login-button white--text" :href="href" color="#4267B2" @click="$emit('click', $event)" :loading="loading">
        <img class="facebook-login-button__icon" src="/app-icons/facebook-logo-transparent-small.png" alt="">
        <span class="facebook-login-button__text">Continue with Facebook</span>
    </VBtn>
</template>

<script>
import { mapState } from 'vuex';

export default {
    props: {
        loading: Boolean,
    },
    computed: {
        ...mapState('app', [
            'facebookAppId',
            'csrfToken',
            'afterLoginUrl',
        ]),
        href() {
            const baseUrl = 'https://www.facebook.com/v10.0/dialog/oauth';
            const redirectUrl = `${location.protocol}//${location.host}/facebook-login`;

            return `${baseUrl}?&scope=email&client_id=${this.facebookAppId}&redirect_uri=${redirectUrl}&state=csrf-token=${this.csrfToken},after-login-url=${this.afterLoginUrl}`;
        }
    }
}
</script>

<style lang="scss">
    .facebook-login-button {
        max-width: 300px;

        &__text {
            margin-left: 1em;
        }
    }
</style>
