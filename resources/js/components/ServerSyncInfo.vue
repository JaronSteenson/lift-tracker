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
import { differenceInSeconds } from 'date-fns';
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
        hideTextOnMobile: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
        const display = useDisplay();

        return {
            display,
            svgIcons,
            STATUS_SAVE_ERROR,
            STATUS_SAVE_IN_PROGRESS,
            STATUS_SAVE_OK,
        };
    },
    data() {
        return {
            now: new Date().toISOString(),
            timerId: null,
        };
    },
    computed: {
        icon() {
            switch (this.status) {
                case this.STATUS_SAVE_OK:
                    return this.svgIcons.saveOk;
                case this.STATUS_SAVE_IN_PROGRESS:
                    return this.svgIcons.saveInProgress;
                case this.STATUS_SAVE_ERROR:
                default:
                    return this.svgIcons.saveFailed;
            }
        },
        message() {
            if (this.hideTextOnMobile && this.display.smAndDown.value) {
                return '';
            }

            if (this.status === this.STATUS_SAVE_ERROR) {
                return 'Error saving';
            }

            if (this.status === this.STATUS_SAVE_IN_PROGRESS) {
                return 'Saving';
            }

            if (!this.updatedAt) {
                return 'Saved';
            }

            const secondsAgo = differenceInSeconds(
                new Date(this.now),
                new Date(this.updatedAt),
            );

            if (secondsAgo > 30) {
                return '';
            }

            return 'Saved just now';
        },
    },
    mounted() {
        this.timerId = window.setInterval(() => {
            this.now = new Date().toISOString();
        }, 1000);
    },
    beforeUnmount() {
        if (this.timerId) {
            window.clearInterval(this.timerId);
        }
    },
};
</script>
