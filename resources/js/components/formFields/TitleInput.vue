<template>
    <textarea v-bind="$attrs"
              :value="value"
              @change="$emit('input', $event.target.value)"
              :placeholder="placeholder"></textarea>
</template>

<script>
    export default {
        name: 'TitleInput',
        props: {
            value: {
                required: false,
                default: '',
            },
            placeholder: {
                type: String,
                required: false,
            },
        },
        methods: {
            resizeTextarea (event) {
                // I have no idea why, but backspacing doesn't resize properly, so if it gets fully empty reset to single line.
                if (!this.value || this.value.length === 0) {
                    event.target.style.height = '36px';
                }

                event.target.style.height = (event.target.scrollHeight) + 'px'
            },
        },
        mounted () {
            this.$nextTick(() => {
                this.$el.setAttribute('style', `height: ${this.$el.scrollHeight}px;`)
            });

            this.$el.addEventListener('input', this.resizeTextarea)
        },
        beforeDestroy () {
            this.$el.removeEventListener('input', this.resizeTextarea)
        },

    }
</script>

<style scoped>
    textarea {
        height: 36px;
        resize: none;
        font-size: 20px;
        min-width: 280px;
        margin: 10px;
        overflow: hidden;
        text-align: center;
    }

    textarea:not(:focus) {
        border: none;
        background: none;
    }
</style>
