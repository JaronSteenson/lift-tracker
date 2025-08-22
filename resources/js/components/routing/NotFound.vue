<template>
    <VContainer fluid class="text-center">
        <VRow justify="center">
            <VCol cols="12">
                <h1 class="display-2 primary--text">404</h1>
                <p><slot></slot></p>
                <VBtn
                    elevation="1"
                    class="home-button"
                    :to="{ name: 'HomePage' }"
                    depressed
                    large
                >
                    Back to Home
                </VBtn>
            </VCol>
        </VRow>
    </VContainer>
</template>

<style lang="scss" scoped>
.home-button {
    border: 1px solid var(--v-primary-base) !important;

    &.VBtn:before {
        opacity: 0 !important;
    }
}
</style>
