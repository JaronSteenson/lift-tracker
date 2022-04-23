<template>
    <div>
        <VContainer class="list-page">
            <VCardTitle class="page-sub-title">{{ subTitle }}</VCardTitle>
            <slot />
            <slot name="fab" />
        </VContainer>
    </div>
</template>

<script>
export default {
    props: {
        subTitle: String,
    },
};
</script>

<style lang="scss" scoped>
.list-page {
    .v-data-table > .v-data-table__wrapper > table > thead > tr > th {
        height: 2px;
    }
}

@media screen and (max-width: 600px) {
    .page-sub-title {
        padding-top: 0;
        padding-bottom: 0;
    }
}
</style>
