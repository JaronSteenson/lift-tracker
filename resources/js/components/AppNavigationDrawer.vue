<template>
    <VNavigationDrawer
        v-if="userIsAuthenticated"
        v-model="drawer"
        app
        :clipped="false"
    >
        <VList dense>
            <VListItem link :to="{ name: 'HomePage' }">
                <template v-slot:prepend>
                    <VIcon color="primary">
                        {{ svgIcons.workoutSession }}
                    </VIcon>
                </template>
                <VListItemTitle>Timeline</VListItemTitle>
            </VListItem>
            <VDivider />
            <VListItem link :to="{ name: 'MyWorkoutProgramsPage' }">
                <template v-slot:prepend>
                    <VIcon color="primary">
                        {{ svgIcons.workoutProgram }}
                    </VIcon>
                </template>
                <VListItemTitle>My workout programs</VListItemTitle>
            </VListItem>
        </VList>
    </VNavigationDrawer>
</template>

<script setup>
import { computed } from 'vue';
import { useAppStore } from '../stores/app';
import { svgIcons } from '../vuetify';

const appStore = useAppStore();

const drawer = computed({
    get() {
        return appStore.navigationDrawerOpen;
    },
    set(value) {
        appStore.setNavigationDrawerOpen(value);
    },
});

const userIsAuthenticated = computed(() => appStore.userIsAuthenticated);
</script>

<style scoped></style>
