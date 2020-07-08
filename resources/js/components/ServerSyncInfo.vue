<template>
    <VSubheader>
        <VIcon
            :size="$vuetify.breakpoint.xsOnly ? 'small' : null"
        >
            mdi-cloud-sync
        </VIcon>
        <span
            class="updated-at"
            :class="$vuetify.breakpoint.xsOnly ? 'updated-at--small mx-1' : 'mx-2'"
        >
            {{ generatedStatusMessage }}
        </span>
    </VSubheader>
</template>
<script>
    import {dateTimeDescription, updatedAtMicro} from "../dates";

    export default {
        props: {
            updatedAt: {
                type: String,
                required: false,
            },
            statusMessage: {
                type: String,
                required: false,
            }
        },
        computed: {
            generatedStatusMessage() {
                if (this.statusMessage) {
                    return this.statusMessage;
                }

                if (this.updatedAt) {
                    if (this.$vuetify.breakpoint.xsOnly) {
                        return `${updatedAtMicro(this.updatedAt)}`;
                    }

                    return `${dateTimeDescription(this.updatedAt)}`;
                }
            }
        }
    }
</script>

<style scoped lang="scss">
    .updated-at {
        &--small {
            font-size: 0.8rem;
        }
    }

</style>
