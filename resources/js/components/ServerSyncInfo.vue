<template>
    <VSubheader class="px-0">
        <VIcon :size="$vuetify.breakpoint.xsOnly ? 'small' : null">
            {{ $svgIcons.mdiCloudSync }}
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

export default {
    components: {
        VSubheader,
    },
    props: {
        updatedAt: {
            type: String,
            required: false,
        },
        statusMessage: {
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
        generatedStatusMessage() {
            this.refreshForce;

            if (this.statusMessage) {
                return this.statusMessage;
            }

            if (this.updatedAt) {
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
