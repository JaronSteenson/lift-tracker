export const PROGRESSION_SCHEME = Object.freeze({
    FIVE_THREE_ONE: 1,
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
});

export const progressionSchemeOptions = [
    { title: 'None', value: null },
    { title: '531', value: PROGRESSION_SCHEME.FIVE_THREE_ONE },
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

export function getProgressionSchemeConfig(progressionScheme) {
    return progressionSchemeConfig[progressionScheme] || defaultConfig;
}
