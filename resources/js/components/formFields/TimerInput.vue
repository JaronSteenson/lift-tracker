<template>
    <VTextField :model-value="time" :label="label" readonly>
        <VMenu
            v-model="showMenu"
            :disabled="disabled"
            :close-on-content-click="false"
            activator="parent"
            min-width="0"
        >
            <VTimePicker
                class="timerInput"
                v-model="time"
                :disabled="disabled"
                @update:model-value="onTimeChange"
            />
        </VMenu>
    </VTextField>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    label: { type: String, required: true },
    disabled: { type: Boolean, required: false },
    modelValue: { type: Number, default: 0 }, // total seconds
});
const emit = defineEmits(['update:modelValue']);

const time = ref('00:00');
const showMenu = ref(false);

// Convert incoming seconds → time string
watch(
    () => props.modelValue,
    (val) => {
        const minutes = Math.floor(val / 60);
        const seconds = val % 60;
        time.value = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    },
    { immediate: true },
);

// Called when v-time-picker updates
const onTimeChange = (newVal) => {
    time.value = newVal;

    let [m, s] = time.value.split(':').map(Number);
    if (m > 12) {
        m -= 12;
    }

    const total = m * 60 + s;
    emit('update:modelValue', total);
};
</script>

<style>
.timerInput {
    .v-picker-title,
    .v-time-picker-controls__ampm {
        display: none;
    }

    .v-time-picker-controls {
        margin-top: 18px;
    }
}
</style>
