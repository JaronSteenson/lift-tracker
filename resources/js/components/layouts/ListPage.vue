<template>
    <VContainer class="list-page">
        <VCardTitle class="page-title">{{ title }}</VCardTitle>
        <slot/>
        <slot v-if="$vuetify.breakpoint.xsOnly" name="fab"/>
    </VContainer>
</template>

<script>
export default {
    props: {
        title: {
            type: String,
            required: true,
        },
    },
}
</script>

<style lang="scss">
.list-page {
    .v-data-table > .v-data-table__wrapper > table > thead > tr > th {
        height: 2px;
    }
}
</style>
