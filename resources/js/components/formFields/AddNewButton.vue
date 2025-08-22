<template>
    <VBtn
        class="add-new-button"
        :to="to"
        @click="$emit('click', $event)"
        variant="outlined"
        :disabled="disabled"
        :width="width"
        height="72"
    >
        <VIcon>{{ $svgIcons.mdiPlus }}</VIcon> <slot />
    </VBtn>
</template>

<script>
export default {
    name: 'AddNewButton',
    props: {
        to: {},
        disabled: {
            type: Boolean,
            default: false,
        },
        width: String,
    },
};
</script>

<style lang="scss" scoped>
.add-new-button {
    border-style: dashed;

    :deep(.v-btn__content) {
        width: 0;
    }
}
</style>
