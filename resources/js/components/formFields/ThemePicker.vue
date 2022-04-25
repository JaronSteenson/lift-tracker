<template>
    <VItemGroup v-model="selectedTheme" mandatory>
        <div
            class="d-flex flex-wrap justify-start justify-sm-space-between gap-4"
        >
            <VItem
                v-for="theme in availableThemes"
                :key="theme.key"
                :value="theme"
                v-slot="{ active, toggle }"
            >
                <VCard
                    class="d-flex flex-column"
                    height="120px"
                    width="150px"
                    :dark="theme.isDark"
                    :light="!theme.isDark"
                    elevation="5"
                    :color="getPreviewCardBackground(theme.isDark)"
                    :style="{
                        border: `solid 1px ${theme.definition.primary}`,
                        'border-width': active ? '4px' : '1px',
                    }"
                    @click="toggle"
                >
                    <VCardTitle
                        class="ma-0 pa-0 justify-center"
                        :style="{
                            height: '33%',
                            color: theme.definition.primary,
                        }"
                    >
                        {{ theme.displayName }}
                    </VCardTitle>
                    <div
                        class="d-flex flex-wrap justify-space-around align-center"
                        :style="{ height: '33%' }"
                    >
                        <VCard
                            :color="theme.definition.primary"
                            height="15px"
                            width="15px"
                        />
                        <VCard
                            v-if="
                                theme.definition.primary !==
                                theme.definition.anchor
                            "
                            :color="theme.definition.anchor"
                            height="15px"
                            width="15px"
                        />
                        <VCard
                            :color="theme.definition.secondary"
                            height="15px"
                            width="15px"
                        />
                        <VCard color="green" height="15px" width="15px" />
                        <VCard color="red" height="15px" width="15px" />
                    </div>
                    <div
                        class="d-flex justify-center align-center is-active-text"
                        :style="{ height: '33%' }"
                    >
                        <VIcon :color="theme.definition.anchor">
                            <template v-if="active">
                                {{ $svgIcons.mdiCheckCircle }}
                            </template>
                            <template v-else>
                                {{ $svgIcons.mdiCheckCircleOutline }}
                            </template>
                        </VIcon>
                    </div>
                </VCard>
            </VItem>
        </div>
    </VItemGroup>
</template>

<script>
import {
    getAvailableThemes,
    saveSelectedThemeKey,
    applyTheme,
    getActiveTheme,
} from '../../vuetify/themes';

export default {
    computed: {
        availableThemes: getAvailableThemes,
        selectedTheme: {
            get: getActiveTheme,
            set(selectedTheme) {
                saveSelectedThemeKey(selectedTheme.key);
                applyTheme(this.$vuetify.theme, selectedTheme);
            },
        },
    },
    methods: {
        getPreviewCardBackground(isDark) {
            return isDark ? 'rgb(30 30 30 / 90%)' : '#f5f5f5';
        },
    },
};
</script>

<style scoped>
.is-active-text {
    min-height: 2.5em;
    font-size: 0.7em;
}
</style>
