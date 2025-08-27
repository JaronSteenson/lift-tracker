<template>
    <VToolbar class="sticky-appbar">
        <VBtn :disabled="!enableBack" icon @click="$emit('back')">
            <VIcon>{{ $svgIcons.mdiChevronLeft }}</VIcon>
        </VBtn>
        <VSpacer />
        <slot />
        <VSpacer />
        <VBtn :disabled="!enableForward" icon @click="$emit('forward')">
            <VIcon>{{ $svgIcons.mdiChevronRight }}</VIcon>
        </VBtn>
    </VToolbar>
</template>

<script>
export default {
    props: {
        enableBack: Boolean,
        enableForward: Boolean,
    },
};
</script>
