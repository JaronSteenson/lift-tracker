<template>
    <div>
        <VMessages :value="[labelFull]" />
        <VSlider
            :disabled="disabled"
            :label="null"
            :max="10 * 60"
            :min="0"
            :prepend-icon="$svgIcons.restPeriod"
            :value="value"
            @input="$emit('input', $event)"
            class="px-0"
            :step="15"
            thumb
            ticks
        >
        </VSlider>
    </div>
</template>

<script>
import { minsSecDuration } from '../../dates';

export default {
    props: {
        label: {
            type: String,
            required: false,
            default: 'Rest period',
        },
        value: {
            type: Number,
            required: false,
        },
        disabled: {
            type: Boolean,
            required: false,
        },
    },
    computed: {
        labelFull() {
            return `${this.label} ${this.minsSecDuration}`;
        },
        minsSecDuration() {
            return minsSecDuration(this.value);
        },
    },
};
</script>

<style lang="scss">
.v-slider {
    margin-left: 0 !important;
}
</style>
