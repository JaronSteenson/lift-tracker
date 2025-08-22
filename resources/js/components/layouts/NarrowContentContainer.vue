<template>
    <div class="narrow-content-container mx-4 my-4">
        <div
            class="narrow-content-container__content gap-4"
            :class="{
                'narrow-content-container__content--full-width': useFullWidth,
            }"
        >
            <slot />
        </div>
    </div>
</template>

<script>
export default {
    props: {
        useFullWidth: Boolean,
    },
};
</script>

<style lang="scss" scoped>
.narrow-content-container {
    display: flex;
    justify-content: center;
    align-items: center;

    &__content {
        display: flex;
        flex-direction: column;
        max-width: min(700px, 100%);
        width: 700px;

        &--full-width {
            max-width: 100%;
            width: 100%;
        }
    }
}
</style>
