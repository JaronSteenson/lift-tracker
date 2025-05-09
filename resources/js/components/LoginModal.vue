<template>
    <VDialog :value="true" max-width="400px" persistent>
        <VCard
            :loading="loading"
            :class="{ 'align-center': $vuetify.breakpoint.xsOnly }"
        >
            <VAlert v-if="sessionExpiryWarning" type="warning">
                Session expired
            </VAlert>
            <VCardActions class="text-center d-block">
                <a href="/login">Login</a>
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
