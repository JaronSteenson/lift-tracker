export const PROGRESSION_SCHEME = Object.freeze({
    FIVE_THREE_ONE: 1,
    GATED_LINEAR: 2,
});

export const PROGRESSION_SCHEME_531_BODY_TYPE = Object.freeze({
    UPPER: 1,
    LOWER: 2,
});

const defaultConfig = Object.freeze({
    weightLabel: 'Weight',
    lockReps: false,
    showSettings: false,
});

const progressionSchemeConfig = Object.freeze({
    [PROGRESSION_SCHEME.FIVE_THREE_ONE]: {
        weightLabel: 'Training max',
        lockReps: true,
        showSettings: true,
    },
    [PROGRESSION_SCHEME.GATED_LINEAR]: {
        weightLabel: 'Weight',
        lockReps: false,
        showSettings: true,
    },
});

export const progressionSchemeOptions = [
    { title: 'None', value: null },
    { title: '531', value: PROGRESSION_SCHEME.FIVE_THREE_ONE },
    {
        title: 'Gated linear progression',
        value: PROGRESSION_SCHEME.GATED_LINEAR,
    },
];

export const progressionScheme531CycleWeekOptions = [
    { title: 'Week 1', value: 1 },
    { title: 'Week 2', value: 2 },
    { title: 'Week 3', value: 3 },
    { title: 'Week 4', value: 4 },
];

export const progressionScheme531BodyTypeOptions = [
    { title: 'Upper body', value: PROGRESSION_SCHEME_531_BODY_TYPE.UPPER },
    { title: 'Lower body', value: PROGRESSION_SCHEME_531_BODY_TYPE.LOWER },
];

export const progressionSchemeGatedLinearWeightGateOptions = [
    { title: 'N/A', value: false },
    { title: 'Use current weight', value: true },
];

export function createProgressionSchemeSettings(
    progressionScheme,
    existingSettings = null,
) {
    switch (progressionScheme) {
        case PROGRESSION_SCHEME.FIVE_THREE_ONE:
            return {
                currentCycleWeek: existingSettings?.currentCycleWeek ?? 1,
                bodyType:
                    existingSettings?.bodyType ??
                    PROGRESSION_SCHEME_531_BODY_TYPE.UPPER,
            };
        case PROGRESSION_SCHEME.GATED_LINEAR:
            return {
                requiredSuccessStreak:
                    existingSettings?.requiredSuccessStreak ?? 1,
                currentSuccessStreak:
                    existingSettings?.currentSuccessStreak ?? 0,
                targetRpe: existingSettings?.targetRpe ?? null,
                targetReps: existingSettings?.targetReps ?? null,
                useWeightGate: existingSettings?.useWeightGate ?? true,
                incrementBy: existingSettings?.incrementBy ?? 2.5,
            };
        default:
            return null;
    }
}

export function getProgressionSchemeConfig(progressionScheme) {
    return progressionSchemeConfig[progressionScheme] || defaultConfig;
}
