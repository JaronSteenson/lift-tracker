<template>
    <div class="rest-period-input">
        <VTextField
            :disabled="disabled"
            :value="minsSecDuration"
            label="Rest period"
            type="text"
            v-if="disabled"
        />
        <div class="rest-period-input__container" v-else>
            <VTextField
                class="rest-period-input__input rest-period-input__input--mins"
                :class="{
                    'rest-period-input__input--small':
                        this.$vuetify.breakpoint.xsOnly,
                }"
                label="Rest period"
                type="number"
                min="0"
                v-model.number="mins"
            />
            <span
                :class="{
                    'rest-period-input__label--small':
                        this.$vuetify.breakpoint.xsOnly,
                    'pr-1': this.$vuetify.breakpoint.xsOnly,
                    'pr-3': this.$vuetify.breakpoint.smAndUp,
                }"
                class="rest-period-input__label"
            >
                mins
            </span>
            <VTextField
                class="rest-period-input__input rest-period-input__input--secs"
                :class="{
                    'rest-period-input__input--small':
                        this.$vuetify.breakpoint.xsOnly,
                }"
                type="number"
                min="0"
                v-model.number="secs"
            />
            <span
                class="rest-period-input__label"
                :class="{
                    'rest-period-input__label--small':
                        this.$vuetify.breakpoint.xsOnly,
                }"
            >
                secs
            </span>
        </div>
    </div>
</template>

<script>
import { minsSecDuration } from '../../dates';

export default {
    props: {
        value: {
            type: Number,
            required: false,
        },
        disabled: Boolean,
    },
    computed: {
        mins: {
            get() {
                return Math.floor(this.value / 60);
            },
            set(value) {
                this.$emit('input', this.secs + value * 60);
            },
        },
        secs: {
            get() {
                return Math.round(this.value - this.mins * 60);
            },
            set(value) {
                this.$emit('input', value + this.mins * 60);
            },
        },
        minsSecDuration() {
            return minsSecDuration(this.value);
        },
    },
};
</script>

<style lang="scss">
.rest-period-input {
    &__input {
        display: inline-block !important;
        width: 2.5rem;

        &--small {
            width: 2rem;
        }

        .v-text-field input {
            width: 2.5rem !important;
        }

        .v-label {
            overflow: visible !important;
        }
    }

    &__label {
        top: 12px;
        position: relative;

        &--small {
            font-size: 0.8em;
        }
    }
}
</style>
