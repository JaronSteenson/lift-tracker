<template>
    <VAppBar app dense>
        <div
            class="d-flex justify-space-between align-center toolbar-content-container"
        >
            <div
                class="text-left"
                :class="{
                    'fixed-outside-flex-basis': $vuetify.breakpoint.smAndUp,
                    'left-align-title': $vuetify.breakpoint.xsOnly,
                }"
            >
                <VBtn :to="backTo" icon active-class="disable-btn-active">
                    <VIcon>
                        {{ $svgIcons.backNavigation }}
                    </VIcon>
                </VBtn>

                <slot v-if="$vuetify.breakpoint.xsOnly" name="middle">
                    <VToolbarTitle class="mx-2 d-flex align-center">
                        {{ title }}
                    </VToolbarTitle>
                </slot>
            </div>

            <slot v-if="$vuetify.breakpoint.smAndUp" name="middle">
                <VToolbarTitle class="mx-2">
                    {{ title }}
                </VToolbarTitle>
            </slot>

            <div
                class="d-flex justify-end"
                :class="{
                    'fixed-outside-flex-basis': $vuetify.breakpoint.smAndUp,
                }"
            >
                <slot name="right" />
            </div>
        </div>
    </VAppBar>
</template>

<script>
export default {
    props: {
        backTo: Object,
        title: String,
    },
};
</script>

<style scoped>
.toolbar-content-container {
    width: 100%;
}

.fixed-outside-flex-basis {
    flex-basis: 30%;
}

.left-align-title {
    display: flex;
    align-items: center;
    flex-grow: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
