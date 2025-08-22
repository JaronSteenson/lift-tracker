<template>
    <div>
        <label class="v-label">{{ labelFull }}</label>
        <VSlider
            :disabled="disabled"
            :label="null"
            :max="10 * 60"
            :min="0"
            :prepend-icon="
                label === 'Warm-up' ? $svgIcons.warmUp : $svgIcons.restPeriod
            "
            :model-value="modelValue || 0"
            @update:model-value="$emit('update:modelValue', $event)"
            class="px-0"
            :step="15"
            :show-ticks="true"
            color="primary"
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
        modelValue: {
            type: Number,
            required: false,
            default: 0,
        },
        disabled: {
            type: Boolean,
            required: false,
        },
    },
    emits: ['update:modelValue'],
    computed: {
        labelFull() {
            return `${this.label} ${this.minsSecDuration}`;
        },
        minsSecDuration() {
            return minsSecDuration(this.modelValue);
        },
    },
};
</script>

<style lang="scss">
.v-slider {
    margin-left: 0 !important;
}
</style>
