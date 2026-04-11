<template>
    <VItemGroup v-model="selectedTheme" mandatory>
        <div
            class="d-flex flex-wrap justify-start justify-sm-space-between gap-4"
        >
            <VItem
                v-for="theme in availableThemes"
                :key="theme.key"
                :value="theme"
                v-slot="{ active }"
            >
                <VCard
                    class="d-flex flex-column"
                    height="120px"
                    width="150px"
                    elevation="5"
                    :style="{
                        border: `solid 1px ${theme.definition.primary}`,
                        'border-width': active ? '4px' : '1px',
                        backgroundColor: theme.definition.background,
                    }"
                    @click="forceThemeSelection(theme)"
                >
                    <div
                        class="d-flex ma-0 pa-0 justify-center align-center"
                        :style="{
                            height: '33%',
                            color: theme.definition.primary,
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            letterSpacing: '0.0892857143em',
                            lineHeight: '1.375rem',
                            textAlign: 'center',
                        }"
                    >
                        {{ theme.displayName }}
                    </div>
                    <div
                        class="d-flex flex-wrap justify-space-around align-center"
                        :style="{ height: '33%' }"
                    >
                        <div
                            :style="{
                                backgroundColor: theme.definition.primary,
                                height: '15px',
                                width: '15px',
                                borderRadius: '2px',
                            }"
                        />
                        <div
                            v-if="
                                theme.definition.primary !==
                                theme.definition.anchor
                            "
                            :style="{
                                backgroundColor: theme.definition.anchor,
                                height: '15px',
                                width: '15px',
                                borderRadius: '2px',
                            }"
                        />
                        <div
                            :style="{
                                backgroundColor: theme.definition.secondary,
                                height: '15px',
                                width: '15px',
                                borderRadius: '2px',
                            }"
                        />
                        <div
                            :style="{
                                backgroundColor: 'green',
                                height: '15px',
                                width: '15px',
                                borderRadius: '2px',
                            }"
                        />
                        <div
                            :style="{
                                backgroundColor: 'red',
                                height: '15px',
                                width: '15px',
                                borderRadius: '2px',
                            }"
                        />
                    </div>
                    <div
                        class="d-flex justify-center align-center is-active-text"
                        :style="{ height: '33%' }"
                    >
                        <VIcon :color="theme.definition.primary">
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
    getActiveTheme,
} from '../../vuetify/themes';
import { svgIcons } from '../../vuetify';

export default {
    setup() {
        return { svgIcons };
    },
    data() {
        return {
            selectedThemeKey: getActiveTheme()?.key || 'dark',
        };
    },
    computed: {
        availableThemes() {
            this.selectedThemeKey;
            return getAvailableThemes();
        },
        selectedTheme: {
            get: getActiveTheme,
            set(selectedTheme) {
                // Validate the selected theme
                if (
                    !selectedTheme ||
                    !selectedTheme.key ||
                    !selectedTheme.definition
                ) {
                    console.error('Invalid theme object:', selectedTheme);
                    return;
                }

                try {
                    saveSelectedThemeKey(selectedTheme.key);
                    this.selectedThemeKey = selectedTheme.key;
                    window.location.reload();
                } catch (error) {
                    console.error('Error in theme setter:', error);
                }
            },
        },
    },
    methods: {
        getPreviewCardBackground() {
            return '#ffffff';
        },
        forceThemeSelection(theme) {
            try {
                saveSelectedThemeKey(theme.key);
                this.selectedThemeKey = theme.key;
                window.location.reload();
            } catch (error) {
                console.error('Error in forceThemeSelection:', error);
            }
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
