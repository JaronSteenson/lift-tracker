<template>
    <VContainer v-show="showTable">
        <div class="d-flex justify-space-between align-center mb-4 gap-4">
            <AddNewButton class="flex-grow-1" :to="{ name: 'CheckInEditPage' }">
                Check-in
            </AddNewButton>
            <AddNewButton
                class="flex-grow-1"
                :to="{ name: 'NewSessionRoutineSelectPage' }"
                data-testid="startNewSessionButton"
            >
                Session
            </AddNewButton>
        </div>
        <VToolbar :color="toolbarColor" elevation="1">
            <VToolbarTitle class="text-left">Timeline</VToolbarTitle>
            <VSwitch
                class="mt-4 pt-1 mr-4"
                v-model="showTable"
                @change="setHomePageShowTable"
                :append-icon="$svgIcons.mdiTable"
            />
        </VToolbar>
        <!-- eslint-disable vue/valid-v-slot -->
        <VDataTable
            :headers="headers"
            :items="data"
            :items-per-page="data.length"
            :loading="isPending"
            hide-default-footer
            mobile-breakpoint="0"
        >
            <template v-slot:item.startedAt="{ item: session }">
                <RouterLink
                    :to="{
                        name: 'SessionOverviewPage',
                        params: { workoutSessionUuid: session.uuid },
                    }"
                >
                    {{ getFormattedDate(session) }}
                </RouterLink>
            </template>
            <template v-slot:item.programName="{ item: session }">
                <ProgramName
                    :workoutProgram="
                        session.workoutProgramUuid
                            ? {
                                  uuid: session.workoutProgramUuid,
                                  name: session.workoutProgramName,
                              }
                            : null
                    "
                />
            </template>
            <template v-slot:item.bodyWeight="{ item: session }">
                {{ session.bodyWeight ? `${session.bodyWeight}kg` : '' }}
            </template>
            <template v-slot:item.duration="{ item: session }">
                {{
                    session.startedAt
                        ? hoursMinutesSecondsFromStartEnd(
                              session.startedAt,
                              session.endedAt,
                          )
                        : ''
                }}
            </template>
            <template v-slot:item.menu="{ item: session }">
                <VMenu bottom left>
                    <template v-slot:activator="{ props }">
                        <VBtn icon flat v-bind="props">
                            <VIcon>{{ $svgIcons.mdiDotsVertical }}</VIcon>
                        </VBtn>
                    </template>

                    <VList>
                        <VListItem
                            :to="{
                                name: 'SessionOverviewPage',
                                params: {
                                    workoutSessionUuid: session.uuid,
                                },
                            }"
                        >
                            <VListItemTitle>View overview</VListItemTitle>
                        </VListItem>
                        <VListItem
                            v-if="session.workoutProgramRoutineUuid"
                            :to="{
                                name: 'NewSessionOverviewPage',
                                params: {
                                    originRoutineUuid:
                                        session.workoutProgramRoutineUuid,
                                },
                            }"
                        >
                            <VListItemTitle>Repeat now</VListItemTitle>
                        </VListItem>
                        <VListItem
                            @click="showDeleteConfirmation(session.uuid)"
                        >
                            <VListItemTitle>Delete</VListItemTitle>
                        </VListItem>
                    </VList>
                </VMenu>
            </template>
        </VDataTable>
        <!-- eslint-enable -->
        <div v-if="loadingNextPage" class="text-center py-4">
            <VProgressCircular indeterminate color="primary" />
            <div class="mt-2 text-body-2 text-medium-emphasis">
                Loading more...
            </div>
        </div>
        <div
            ref="tableInfiniteScrollSentinel"
            class="infinite-scroll-sentinel"
        />
    </VContainer>

    <NarrowContentContainer
        v-if="!isPending"
        class="flex-column gap-4"
        v-show="!showTable"
        :class="{ 'd-flex': !showTable }"
    >
        <div class="d-flex justify-space-between align-center gap-4">
            <AddNewButton class="flex-grow-1" :to="{ name: 'CheckInEditPage' }">
                Check-in
            </AddNewButton>
            <AddNewButton
                class="flex-grow-1"
                :to="{ name: 'NewSessionRoutineSelectPage' }"
                data-testid="startNewSessionButton"
            >
                Session
            </AddNewButton>
        </div>
        <VToolbar class="sticky-toolbar" :color="toolbarColor" elevation="1">
            <VToolbarTitle class="text-left">Timeline</VToolbarTitle>
            <VSwitch
                class="mt-4 pt-1 mr-4"
                v-model="showTable"
                @change="setHomePageShowTable"
                :append-icon="$svgIcons.mdiTable"
            />
        </VToolbar>
        <SessionStatsCard
            v-for="workoutSession in data"
            :key="workoutSession.uuid"
            :workout-session="workoutSession"
            link-title
        />
        <div v-if="loadingNextPage" class="text-center py-4">
            <VProgressCircular indeterminate color="primary" />
            <div class="mt-2 text-body-2 text-medium-emphasis">
                Loading more...
            </div>
        </div>
        <div
            ref="cardInfiniteScrollSentinel"
            class="infinite-scroll-sentinel"
        />
    </NarrowContentContainer>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import NarrowContentContainer from '../layouts/NarrowContentContainer';
import SessionStatsCard from '../domain/workoutSessions/SessionStatsCard';
import { dateDescription, hoursMinutesSecondsFromStartEnd } from '../../dates';
import ProgramName from '../domain/programBuilder/ProgramName';
import AddNewButton from '../formFields/AddNewButton.vue';
import { useDisplay } from 'vuetify';
import { useTheme } from 'vuetify/framework';
import {
    useDeleteWorkoutSession,
    isInProgressWorkout as checkIsInProgressWorkout,
} from '../domain/workoutSessions/composibles/workoutSessionQueries';

const props = defineProps({
    data: {
        type: Array,
        required: true,
    },
    isPending: {
        type: Boolean,
        required: true,
    },
    fetchNextPage: {
        type: Function,
        required: true,
    },
    hasNextPage: {
        type: Boolean,
        required: false,
        default: false,
    },
});

const display = useDisplay();
const theme = useTheme();

const { deleteWorkoutSession } = useDeleteWorkoutSession();

const toolbarColor = theme.current.value.colors.toolbar;
const INFINITE_SCROLL_ROOT_MARGIN = '0px 0px 300px 0px';

const showTable = ref(localStorage.getItem('homePageShowTable') === 'true');
const loadingNextPage = ref(false);
const tableInfiniteScrollSentinel = ref(null);
const cardInfiniteScrollSentinel = ref(null);
let infiniteScrollObserver = null;

const headers = computed(() => {
    if (display.xs.value) {
        return [
            {
                title: 'Date',
                key: 'startedAt',
                sortable: false,
            },
            {
                title: 'Routine',
                key: 'name',
                sortable: false,
            },
            {
                title: 'BW',
                key: 'bodyWeight',
                sortable: false,
            },
        ];
    }

    return [
        {
            title: 'Date',
            key: 'startedAt',
            width: '20%',
            sortable: false,
        },
        {
            title: 'Routine',
            key: 'name',
            width: '20%',
            sortable: false,
        },
        {
            title: 'Program',
            key: 'programName',
            width: '20%',
            sortable: false,
        },
        {
            title: 'Body weight',
            key: 'bodyWeight',
            width: '20%',
            sortable: false,
        },
        {
            title: 'Total duration',
            key: 'duration',
            width: '20%',
            sortable: false,
        },
        {
            title: '',
            key: 'menu',
            align: 'end',
            sortable: false,
        },
    ];
});

function setHomePageShowTable() {
    localStorage.setItem(
        'homePageShowTable',
        Boolean(showTable.value).toString(),
    );
}

async function loadNextPage() {
    loadingNextPage.value = true;
    try {
        await props.fetchNextPage();
    } finally {
        loadingNextPage.value = false;
    }
}

function showDeleteConfirmation(workoutSessionUuid) {
    const deleteConfirmed = window.confirm(
        'Are you sure you want to delete this workout?',
    );

    if (deleteConfirmed) {
        deleteWorkoutSession(workoutSessionUuid);
    }
}

function getFormattedDate(workoutSession) {
    let startedAt = dateDescription(
        workoutSession.startedAt || workoutSession.createdAt,
    );

    if (checkIsInProgressWorkout(workoutSession, workoutSession.uuid)) {
        startedAt = `${startedAt} (in progress)`;
    }

    return startedAt;
}

function observeInfiniteScrollSentinel(element) {
    if (element && infiniteScrollObserver) {
        infiniteScrollObserver.observe(element);
    }
}

onMounted(() => {
    if (typeof IntersectionObserver === 'undefined') {
        return;
    }

    infiniteScrollObserver = new IntersectionObserver(
        (entries) => {
            const shouldLoadNextPage = entries.some(
                (entry) => entry.isIntersecting,
            );

            if (
                shouldLoadNextPage &&
                !props.isPending &&
                !loadingNextPage.value &&
                props.hasNextPage
            ) {
                loadNextPage();
            }
        },
        {
            root: null,
            rootMargin: INFINITE_SCROLL_ROOT_MARGIN,
        },
    );

    observeInfiniteScrollSentinel(tableInfiniteScrollSentinel.value);
    observeInfiniteScrollSentinel(cardInfiniteScrollSentinel.value);
});

watch(tableInfiniteScrollSentinel, (newElement, oldElement) => {
    if (oldElement && infiniteScrollObserver) {
        infiniteScrollObserver.unobserve(oldElement);
    }

    observeInfiniteScrollSentinel(newElement);
});

watch(cardInfiniteScrollSentinel, (newElement, oldElement) => {
    if (oldElement && infiniteScrollObserver) {
        infiniteScrollObserver.unobserve(oldElement);
    }

    observeInfiniteScrollSentinel(newElement);
});

onBeforeUnmount(() => {
    infiniteScrollObserver?.disconnect();
});
</script>

<style scoped>
.infinite-scroll-sentinel {
    height: 1px;
}
</style>
