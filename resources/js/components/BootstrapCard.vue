<template>
    <div class="card">
        <div class="card-header d-flex justify-content-center">
            <span class="title-text" v-if="title">{{ title }}</span>
            <slot v-else name="header"></slot>
        </div>
        <div class="card-body">
            <slot></slot>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'BootstrapCard',
        props: ['title'],
    }
</script>

<style scoped>
    .title-text {
        font-size: 16px;
    }
</style>
