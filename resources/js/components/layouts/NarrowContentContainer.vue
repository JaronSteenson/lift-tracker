<template>
    <div class="narrow-content-container mx-2 my-4">
        <div
            class="narrow-content-container__content gap-4"
            :style="{
                'min-width': $vuetify.breakpoint.mdAndUp ? '600px' : undefined,
            }"
        >
            <slot />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.narrow-content-container {
    display: flex;
    justify-content: center;
    align-items: center;

    &__content {
        display: flex;
        flex-direction: column;
        max-width: 700px;
    }
}
</style>
