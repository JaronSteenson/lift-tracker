<template>
    <component v-bind="barProps">
        <div
            class="d-flex justify-space-between align-center toolbar-content-container"
        >
            <div
                class="text-left"
                :class="{
                    'fixed-outside-flex-basis': $vuetify.breakpoint.smAndUp,
                    'left-align-title': $vuetify.breakpoint.xsOnly
                }"
            >
                <RouterLink :to="backTo">
                    <VIcon :color="isAppBar ? null : 'grey'">{{ $svgIcons.backNavigation }}</VIcon>
                </RouterLink>

                <slot v-if="$vuetify.breakpoint.xsOnly" name="middle">
                    <VToolbarTitle class="mx-2">
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
                :class="{ 'fixed-outside-flex-basis': $vuetify.breakpoint.smAndUp }"
            >
                <slot name="right"/>
            </div>
        </div>
    </component>
</template>

<script>
export default {
    props: {
        backTo: Object,
        title: String,
    },
    computed: {
        barProps() {
            if (this.isAppBar) {
                return {
                    is: 'VAppBar',
                    app: true,
                    color: 'primary',
                    dark: true,
                };
            }

            return {
                is: 'VToolbar',
            };
        },
        isAppBar() {
            return this.$vuetify.breakpoint.smAndDown;
        }
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

    .left-align-title {
        display: flex;
        flex-grow: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>
