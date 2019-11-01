<template>
    <span>
        <i class="fa fa-plus"></i> <slot></slot>
    </span>
</template>
<script>
    export default {
        name: 'AddButton'
    }
</script>
<style scoped>
    span {
        cursor: pointer;
        opacity: 0.75;
        padding: 5px;
        border-radius: 0.25rem;
    }

    span:hover {
        background-color: #eae9ea;
    }
</style>
