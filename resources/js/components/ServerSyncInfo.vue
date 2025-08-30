<template>
    <div class="d-flex gap-2 align-center text-caption text-medium-emphasis">
        <VIcon>
            {{ icon }}
        </VIcon>
        <div>
            {{ message }}
        </div>
    </div>
</template>
<script>
import { useAppStore } from '../stores/app';
import { useDisplay } from 'vuetify';
import { svgIcons } from '../vuetify';

// Save status constants
export const STATUS_SAVE_ERROR = 'error';
export const STATUS_SAVE_IN_PROGRESS = 'saving';
export const STATUS_SAVE_OK = 'saved';

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
        message() {
            if (this.status === this.STATUS_SAVE_ERROR) {
                if (this.display.smAndDown.value) {
                    return '';
                }

                return 'Error saving';
            }

            if (this.status === this.STATUS_SAVE_IN_PROGRESS) {
                if (this.display.smAndDown.value) {
                    return '';
                }

                return 'Saving';
            }

            if (this.userIsLocalOnly) {
                return 'Saved locally';
            }

            return '';
        },
    },
};
</script>
