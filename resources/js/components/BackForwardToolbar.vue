<template>
    <VCardTitle class="back-forward-toolbar">
        <VBtn :disabled="!enableBack" icon @click="$emit('back')">
            <VIcon>{{ $svgIcons.mdiChevronLeft }}</VIcon>
        </VBtn>
        <slot />
        <VBtn :disabled="!enableForward" icon @click="$emit('forward')">
            <VIcon>{{ $svgIcons.mdiChevronRight }}</VIcon>
        </VBtn>
    </VCardTitle>
</template>

<script>
export default {
    props: {
        enableBack: Boolean,
        enableForward: Boolean,
    },
};
</script>

<style lang="scss" scoped>
.back-forward-toolbar {
    position: sticky;
    position: -webkit-sticky;
    top: 0;
    display: flex;
    justify-content: space-between;
    background-color: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    padding-left: 12px !important;
    padding-right: 12px !important;
}
</style>
