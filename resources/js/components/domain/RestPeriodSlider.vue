<template>
    <div>
        <VMessages v-if="$vuetify.breakpoint.xsOnly" :value="['Rest period (mins)']"/>
        <VSlider
            :step="step"
            :disabled="disabled"
            :label="$vuetify.breakpoint.smAndUp ? 'Rest period (mins)' : null"
            :max="5 * 60"
            :min="0"
            :prepend-icon="$vuetify.breakpoint.smAndUp ? 'mdi-clock' : null"
            :value="value"
            @input="$emit('input', $event)"
            class="px-0"
            step="15"
            thumb
            ticks
        >
            <template v-slot:append>
                <span>{{ value | minsSecDuration }}</span>
            </template>
        </VSlider>
    </div>
</template>

<script>
    export default {
        props: {
            value: {
                type: Number,
                required: false,
            },
            step: {
                type: Number,
                required: false,
            },
            disabled: {
                type: Boolean,
                required: false,
            },
        },
    }
</script>

<style lang="scss">
    .v-slider {
        margin-left: 0 !important;
    }
</style>
