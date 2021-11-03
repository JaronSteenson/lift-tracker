<template>
    <div>
        <VMessages v-if="$vuetify.breakpoint.xsOnly" :value="[label]"/>
        <VSlider
            :step="step"
            :disabled="disabled"
            :label="$vuetify.breakpoint.smAndUp ? label : null"
            :max="5 * 60"
            :min="0"
            :prepend-icon="$vuetify.breakpoint.smAndUp ? $svgIcons.mdiClock : null"
            :value="value"
            @input="$emit('input', $event)"
            class="px-0"
            step="15"
            thumb
            ticks
        >
        </VSlider>
    </div>
</template>

<script>
    import { minsSecDuration } from "../../dates";

    export default {
        props: {
            value: {
                type: Number,
                required: false,
            },
            step: {
                type: Number,
                required: false,
            },
            disabled: {
                type: Boolean,
                required: false,
            },
        },
        computed: {
            label() {
                return `Rest period ${this.minsSecDuration}`
            },
            minsSecDuration() {
                return minsSecDuration(this.value)
            }
        }
    }
</script>

<style lang="scss">
    .v-slider {
        margin-left: 0 !important;
    }
</style>
