<template>
    <VSubheader class="px-0">
        <VIcon :size="$vuetify.breakpoint.xsOnly ? 'small' : null">
            {{ icon }}
        </VIcon>
        <span
            class="updated-at"
            :class="
                $vuetify.breakpoint.xsOnly ? 'updated-at--small mx-1' : 'mx-2'
            "
        >
            {{ generatedStatusMessage }}
        </span>
    </VSubheader>
</template>
<script>
import { dateTimeDescription, updatedAtMicro } from '../dates';
import VSubheader from 'vuetify/lib/components/VSubheader';
import {
    STATUS_SAVE_ERROR,
    STATUS_SAVE_IN_PROGRESS,
    STATUS_SAVE_OK,
} from '../store/modules/saveStatusMixin';

export default {
    components: {
        VSubheader,
    },
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
    data() {
        return {
            refreshForce: null,
            refreshInterval: null,
        };
    },
    created() {
        this.startRefreshInterval();
    },
    destroyed() {
        this.clearRefreshInterval();
    },
    computed: {
        icon() {
            switch (this.status) {
                case STATUS_SAVE_OK:
                    return this.$svgIcons.saveOk;
                case STATUS_SAVE_IN_PROGRESS:
                    return this.$svgIcons.saveInProgress;
                case STATUS_SAVE_ERROR:
                default:
                    return this.$svgIcons.saveFailed;
            }
        },
        generatedStatusMessage() {
            this.refreshForce;

            if (this.status === STATUS_SAVE_ERROR) {
                if (this.$vuetify.breakpoint.smAndDown) {
                    return '';
                }

                return 'Error saving';
            }

            if (this.status === STATUS_SAVE_IN_PROGRESS) {
                if (this.$vuetify.breakpoint.smAndDown) {
                    return '...';
                }

                return 'Saving';
            }

            if (this.updatedAt >= 0) {
                if (this.$vuetify.breakpoint.mdAndDown) {
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
