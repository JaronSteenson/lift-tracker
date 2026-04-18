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
            <div class="projection-surface">
                <div
                    v-if="!hasPersistedExercise"
                    class="projection-empty-state text-body-2 text-medium-emphasis"
                >
                    Save the program to load the 4-week 531 projection.
                </div>
                <VRow v-else-if="isProjectionLoading" class="projection-grid">
                    <VCol v-for="index in 4" :key="index" cols="12" md="6">
                        <VCard variant="outlined" class="projection-week-card">
                            <VCardText class="projection-card-text">
                                <VSkeletonLoader
                                    type="heading, text@3"
                                    boilerplate
                                />
                            </VCardText>
                        </VCard>
                    </VCol>
                </VRow>
                <div
                    v-else-if="!projection?.weeks?.length"
                    class="projection-empty-state text-body-2 text-medium-emphasis"
                >
                    Projection will appear here.
                </div>
                <VRow v-else class="projection-grid">
                    <VCol
                        v-for="week in projection.weeks"
                        :key="week.week"
                        cols="12"
                        md="6"
                    >
                        <VCard variant="outlined" class="projection-week-card">
                            <VCardText class="projection-card-text">
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
            </div>
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

<style scoped>
.projection-surface {
    min-height: 288px;
}

.projection-grid {
    margin: -6px;
}

.projection-grid :deep(.v-col) {
    padding: 6px;
}

.projection-card-text {
    min-height: 126px;
}

.projection-week-card {
    border-color: rgba(var(--v-theme-on-surface), 0.08) !important;
}

.projection-empty-state {
    min-height: 288px;
    display: flex;
    align-items: center;
}
</style>
