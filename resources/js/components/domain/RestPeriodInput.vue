<template>
    <div class="rest-period-input">
        <VTextField
            v-if="disabled"
            :disabled="true"
            :model-value="minsSecDuration"
            :label="label"
            type="text"
            readonly
        />
        <div v-else class="d-flex align-center gap-2">
            <VTextField
                :label="label"
                type="number"
                min="0"
                max="59"
                :model-value="mins"
                @update:model-value="updateMins"
                style="width: 80px"
                density="compact"
                hide-details
            />
            <span class="text-body-2">mins</span>
            <VTextField
                type="number"
                min="0"
                max="59"
                :model-value="secs"
                @update:model-value="updateSecs"
                style="width: 80px"
                density="compact"
                hide-details
            />
            <span class="text-body-2">secs</span>
        </div>
    </div>
</template>

<script>
import { minsSecDuration } from '../../dates';

export default {
    props: {
        label: {
            type: String,
        },
        modelValue: {
            type: Number,
            required: false,
            default: 0,
        },
        disabled: Boolean,
    },
    emits: ['update:modelValue'],
    computed: {
        mins() {
            return Math.floor((this.modelValue || 0) / 60);
        },
        secs() {
            return Math.round((this.modelValue || 0) - this.mins * 60);
        },
        minsSecDuration() {
            return minsSecDuration(this.modelValue || 0);
        },
    },
    methods: {
        updateMins(value) {
            const newValue = Number(value) || 0;
            this.$emit('update:modelValue', this.secs + newValue * 60);
        },
        updateSecs(value) {
            const newValue = Number(value) || 0;
            this.$emit('update:modelValue', newValue + this.mins * 60);
        },
    },
};
</script>

<style lang="scss" scoped>
.rest-period-input {
    .gap-2 {
        gap: 8px;
    }
}
</style>
