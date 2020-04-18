<template>
    <span @click="$emit('click', $event)" class="editable-title" role="button">
        <slot />
    </span>
</template>

<script>
    export default {

    }
</script>

<style lang="scss" scoped>
    .editable-title {
        flex-grow: 1;
    }
</style>
