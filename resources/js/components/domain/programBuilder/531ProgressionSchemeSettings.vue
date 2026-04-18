<template>
    <VRow>
        <VCol cols="12" md="6">
            <VSelect
                :model-value="settings?.currentCycleWeek ?? null"
                :items="progressionScheme531CycleWeekOptions"
                label="Current cycle week"
                variant="outlined"
                @update:model-value="updateSetting('currentCycleWeek', $event)"
            />
        </VCol>
        <VCol cols="12" md="6">
            <VSelect
                :model-value="settings?.bodyType ?? null"
                :items="progressionScheme531BodyTypeOptions"
                label="Body type"
                variant="outlined"
                @update:model-value="updateSetting('bodyType', $event)"
            />
        </VCol>
        <VCol cols="12">
            <div class="text-subtitle-2 mb-2">Cycle projection</div>
            <div
                v-if="!hasPersistedExercise"
                class="text-body-2 text-medium-emphasis"
            >
                Save the program to load the 4-week 531 projection.
            </div>
            <div
                v-else-if="isProjectionLoading"
                class="text-body-2 text-medium-emphasis"
            >
                Loading cycle projection...
            </div>
            <div
                v-else-if="!projection?.weeks?.length"
                class="text-body-2 text-medium-emphasis"
            >
                Projection will appear here.
            </div>
            <VRow v-else>
                <VCol
                    v-for="week in projection.weeks"
                    :key="week.week"
                    cols="12"
                    md="6"
                >
                    <VCard variant="outlined">
                        <VCardText>
                            <div class="text-subtitle-2 mb-2">
                                {{ week.label }}
                            </div>
                            <div
                                v-for="set in week.sets"
                                :key="`${week.week}-${set.position}`"
                                class="text-body-2"
                            >
                                {{ set.weight }}kg x {{ set.reps }}
                                <span v-if="set.isAmrap">+</span>
                            </div>
                        </VCardText>
                    </VCard>
                </VCol>
            </VRow>
        </VCol>
    </VRow>
</template>

<script setup>
import {
    progressionScheme531BodyTypeOptions,
    progressionScheme531CycleWeekOptions,
} from './progressionSchemeRegistry';

const props = defineProps({
    settings: {
        type: Object,
        default: null,
    },
    projection: {
        type: Object,
        default: null,
    },
    isProjectionLoading: {
        type: Boolean,
        default: false,
    },
    hasPersistedExercise: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['update:settings']);

function updateSetting(key, value) {
    emit('update:settings', {
        ...(props.settings || {}),
        [key]: value,
    });
}
</script>
