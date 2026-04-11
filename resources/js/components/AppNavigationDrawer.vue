<template>
    <VNavigationDrawer
        v-if="userIsAuthenticated"
        :model-value="navigationDrawerOpen"
        @update:model-value="setNavigationDrawerOpen"
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
                <VListItemTitle>My programs</VListItemTitle>
            </VListItem>
        </VList>
    </VNavigationDrawer>
</template>

<script setup>
import { useAuth } from './domain/auth/composables/useAuth';
import { useAppShell } from '../composables/useAppShell';
import { svgIcons } from '../vuetify';

const { userIsAuthenticated } = useAuth();
const { navigationDrawerOpen, setNavigationDrawerOpen } = useAppShell();
</script>

<style scoped></style>
