<template>
    <span class="close-cross-icon"></span>
</template>

<script>
    export default {
        name: 'CloseCross',
    }
</script>

<style scoped>
    .close-cross-icon:before {
        content: '\00d7';
        font-size: 20px;
        margin-right: 15px;
    }
    .close-cross-icon {
        position: absolute;
        top: 0;
        right: 0;
        cursor: pointer;
    }
</style>