<template>
    <div class="px-0 d-flex align-center text-caption text-medium-emphasis">
        <VIcon :size="display.xs.value ? 'small' : null">
            {{ icon }}
        </VIcon>
        <span
            class="updated-at"
            :class="display.xs.value ? 'updated-at--small mx-1' : 'mx-2'"
        >
            {{ generatedStatusMessage }}
        </span>
    </div>
</template>
<script>
import { dateTimeDescription, updatedAtMicro } from '../dates';
import { useAppStore } from '../stores/app';
import { useDisplay } from 'vuetify';
import { svgIcons } from '../vuetify';

// Save status constants
const STATUS_SAVE_ERROR = 'error';
const STATUS_SAVE_IN_PROGRESS = 'saving';
const STATUS_SAVE_OK = 'saved';

export default {
    name: 'ServerSyncInfo',
    props: {
        updatedAt: {
            type: String,
            required: false,
        },
        status: {
            type: String,
            required: false,
        },
    },
    setup() {
        const appStore = useAppStore();
        const display = useDisplay();

        return {
            appStore,
            display,
            svgIcons,
            STATUS_SAVE_ERROR,
            STATUS_SAVE_IN_PROGRESS,
            STATUS_SAVE_OK,
        };
    },
    data() {
        return {
            refreshForce: null,
            refreshInterval: null,
        };
    },
    created() {
        this.startRefreshInterval();
    },
    unmounted() {
        this.clearRefreshInterval();
    },
    computed: {
        userIsLocalOnly() {
            return this.appStore.userIsLocalOnly;
        },
        icon() {
            switch (this.status) {
                case this.STATUS_SAVE_OK:
                    if (this.userIsLocalOnly) {
                        return this.svgIcons.mdiCheckCircle;
                    }

                    return this.svgIcons.saveOk;
                case this.STATUS_SAVE_IN_PROGRESS:
                    return this.svgIcons.saveInProgress;
                case this.STATUS_SAVE_ERROR:
                default:
                    return this.svgIcons.saveFailed;
            }
        },
        generatedStatusMessage() {
            this.refreshForce;

            if (this.status === this.STATUS_SAVE_ERROR) {
                if (this.display.smAndDown.value) {
                    return '';
                }

                return 'Error saving';
            }

            if (this.status === this.STATUS_SAVE_IN_PROGRESS) {
                if (this.display.smAndDown.value) {
                    return '...';
                }

                return 'Saving';
            }

            if (this.userIsLocalOnly) {
                return 'Saved locally';
            }

            if (
                this.updatedAt &&
                this.updatedAt !== null &&
                this.updatedAt !== undefined
            ) {
                if (this.display.mdAndDown.value) {
                    return `${updatedAtMicro(this.updatedAt)}`;
                }

                return `${dateTimeDescription(this.updatedAt)}`;
            }

            return '';
        },
    },
    methods: {
        startRefreshInterval() {
            this.refreshInterval = setInterval(() => {
                this.refreshForce = Date.now();
            }, 60 * 1000);
        },
        clearRefreshInterval() {
            clearInterval(this.interval);
        },
    },
};
</script>

<style scoped lang="scss">
.updated-at {
    &--small {
        font-size: 0.8rem;
    }
}
</style>
