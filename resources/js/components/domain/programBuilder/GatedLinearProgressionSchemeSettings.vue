<template>
    <VRow>
        <VCol cols="12" md="6">
            <VTextField
                :model-value="settings?.requiredSuccessStreak ?? null"
                label="Successful workouts required"
                type="number"
                min="1"
                step="1"
                variant="outlined"
                hint="Advance after this many consecutive successful workouts."
                persistent-hint
                @update:model-value="
                    updateNullableNumberSetting('requiredSuccessStreak', $event)
                "
            />
        </VCol>
        <VCol cols="12" md="6">
            <VTextField
                :model-value="settings?.incrementBy ?? null"
                label="Increment by (kg)"
                type="number"
                min="0.5"
                step="0.5"
                variant="outlined"
                @update:model-value="
                    updateNullableNumberSetting('incrementBy', $event)
                "
            />
        </VCol>
        <VCol cols="12" md="4">
            <VSelect
                :model-value="settings?.targetRpe ?? null"
                :items="rpeGateOptions"
                label="Max RPE"
                variant="outlined"
                @update:model-value="updateSetting('targetRpe', $event)"
            />
        </VCol>
        <VCol cols="12" md="4">
            <VTextField
                :model-value="settings?.targetReps ?? null"
                label="Min reps"
                type="number"
                min="0.5"
                step="0.5"
                variant="outlined"
                hint="Leave blank for N/A."
                persistent-hint
                clearable
                @update:model-value="
                    updateNullableNumberSetting('targetReps', $event)
                "
            />
        </VCol>
        <VCol cols="12" md="4">
            <VSelect
                :model-value="settings?.useWeightGate ?? true"
                :items="progressionSchemeGatedLinearWeightGateOptions"
                label="Weight gate"
                variant="outlined"
                @update:model-value="updateSetting('useWeightGate', $event)"
            />
        </VCol>
        <VCol cols="12">
            <div class="text-body-2 text-medium-emphasis">
                All logged sets must pass every enabled gate. Misses reset the
                streak, and the weight gate uses the current exercise weight.
            </div>
        </VCol>
        <VCol cols="12">
            <div class="text-caption text-medium-emphasis">
                Current streak:
                {{ settings?.currentSuccessStreak ?? 0 }} /
                {{ settings?.requiredSuccessStreak ?? 1 }}
            </div>
        </VCol>
    </VRow>
</template>

<script setup>
import { progressionSchemeGatedLinearWeightGateOptions } from './progressionSchemeRegistry';

const props = defineProps({
    settings: {
        type: Object,
        default: null,
    },
});

const emit = defineEmits(['update:settings']);

const rpeGateOptions = [
    { title: 'N/A', value: null },
    ...Array.from({ length: 10 }, (_, index) => ({
        title: String(index + 1),
        value: index + 1,
    })),
];

function updateSetting(key, value) {
    emit('update:settings', {
        ...(props.settings || {}),
        [key]: value,
    });
}

function updateNullableNumberSetting(key, value) {
    if (value === null || value === undefined || value === '') {
        updateSetting(key, null);
        return;
    }

    const parsedValue = Number(value);
    updateSetting(key, Number.isFinite(parsedValue) ? parsedValue : null);
}
</script>
