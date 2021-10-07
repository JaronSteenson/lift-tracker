<template>
    <span
        class="archived-value"
        :class="{'missing-value--full-opacity': fullOpacity}"
    >
        <slot/>
    </span>
</template>

<script>
     export default {
        props: {
            fullOpacity: Boolean
        }
    }
</script>

<style scoped lang="scss">
.missing-value {
    opacity: 0.7;
    font-style: italic;

    &--full-opacity {
        opacity: 1;
    }
}
</style>
