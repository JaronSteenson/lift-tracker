<template>
    <VToolbar>
        <div
            class="d-flex justify-space-between align-center toolbar-content-container"
        >
            <div
                class="text-left"
                :class="{ 'fixed-outside-flex-basis': $vuetify.breakpoint.smAndUp }"
            >
                <RouterLink :to="backTo">
                    <VIcon>{{ $svgIcons.backNavigation }}</VIcon>
                </RouterLink>
            </div>

            <slot name="middle">
                <VToolbarTitle>
                    {{ title }}
                </VToolbarTitle>
            </slot>

            <div
                class="d-flex justify-end"
                :class="{ 'fixed-outside-flex-basis': $vuetify.breakpoint.smAndUp }"
            >
                <slot name="right"/>
            </div>
        </div>
    </VToolbar>
</template>

<script>
export default {
    props: {
        backTo: Object,
        title: String,
    },
}
</script>

<style scoped>
    .toolbar-content-container {
        width: 100%;
    }

    .fixed-outside-flex-basis {
        flex-basis: 30%;
    }
</style>
