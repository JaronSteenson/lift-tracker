<template>
    <input class="title-input" :value="value" @input="$emit('input', $event)"
           :style="{ width }">
</template>

<script>
    const FONT_SIZE_PX = 20;

    export default {
        name: "TitleInput",
        props: {
            value: {
                type: String,
                required: true,
            },
            autoGrow: {
                type: Boolean,
                required: false,
                default: false,
            }
        },
        computed: {
            width() {
                if (!this.autoGrow) {
                    return '220px';
                }

                let characters = this.value.length;

                if (characters >= 40) {
                    return '520px';
                }

                if (characters >= 30) {
                    return '420px';
                }

                if (characters >= 20) {
                    return '320px';
                }

                return '280px';
            }
        }

    }
</script>

<style scoped>
    .title-input {
        border: none;
        background: none;
        min-height: 30px;
        font-size: 20px;
        min-width: 280px;
        margin: 10px;
    }

    .title-input:focus {
        border: none;
        outline: none;
        box-shadow: none !important;
    }
</style>
