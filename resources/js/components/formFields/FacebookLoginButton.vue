<template>
    <VBtn class="facebook-login-button white--text" :href="href" color="#4267B2" @click="$emit('click', $event)" :loading="loading">
        <img class="facebook-login-button__icon" :src="mdiFacebookLogoDataUri" alt="Facebook logo">
        <span class="facebook-login-button__text">Continue with Facebook</span>
    </VBtn>
</template>

<script>
import { mapState } from 'vuex';

export default {
    props: {
        loading: Boolean,
    },
    data() {
        return {
            mdiFacebookLogoDataUri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAHdElNRQfjBBYGJDeRLlUUAAABR0lEQVQ4y5WUvUoDQRSFv2zSpRNUdpOAGAXfwSa1WTAo9lpEC2PhG+Q5FkHQ1iKNIJa+hApaJSoRYxHSJCYeizXuz2x+PAvL3pnz3Zm9w52UiChHhTJFHOCVZ65p8BJxKHhseRoqrqE82YErsLvqapK6cuNATSNN00i1MODOsPuIOwbshM28aV+ryigrJ7Qx2wc8w/6uxVAxAnkC5RMqcyQSgaFyFtukiesOgBXu/f/8U5qKRRlTTwDssWHMlC2KCcAXANmEmaKFw3/kpNSLZEoZlgU6oahn0Z6Rcy0StS0eZgDrkegxwy1boYF66F2iBGxGgBtU0MA4OP/A6sb4QAWLJpdz1+iCJkJ5deZa4VN5YQEtqmiO/Ae0ghat6nvqCiMdxlt0Rx8TgY52zZ5Gts7UN4C+zrWcdAmMoRM1fr+PdaVTLUUdPzATB+2c4R9jAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE5LTA0LTIyVDEzOjM2OjU1LTA3OjAwi4nE0AAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxOS0wNC0yMlQxMzozNjo1NS0wNzowMPrUfGwAAAAASUVORK5CYII=',
        }
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
    },
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
