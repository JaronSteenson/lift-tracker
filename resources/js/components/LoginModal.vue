<template>
    <VDialog :value="true" max-width="400px" persistent>
        <VCard
            :loading="loading"
            :class="{ 'align-center': $vuetify.breakpoint.xsOnly }"
        >
            <VAlert v-if="sessionExpiryWarning" type="warning">
                Session expired
            </VAlert>
            <VCardTitle class="d-block text-center">
                Please log in to continue
            </VCardTitle>
            <VCardText class="text-center pl-2 pr-2"> </VCardText>
            <VCardActions class="text-center d-block">
                <a href="/privacy-policy">Privacy policy</a>
            </VCardActions>
        </VCard>
    </VDialog>
</template>
<script>
export default {
    components: {},
    props: {
        sessionExpiryWarning: Boolean,
    },
    data() {
        return {
            loading: false,
        };
    },
};
</script>
