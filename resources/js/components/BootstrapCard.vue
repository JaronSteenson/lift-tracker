<template>
    <div class="card">
        <div v-if="hasHeader" class="card-header">
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

        computed: {
            hasHeader () {
                return Boolean(this.$slots.header || this.title);
            }
        },
    }
</script>

<style scoped>
    .card {
        margin-bottom: 30px;
    }
    .card-header {
        padding-top: 0;
        padding-bottom: 0;
    }
    .title-text {
        font-size: 16px;
    }
</style>
