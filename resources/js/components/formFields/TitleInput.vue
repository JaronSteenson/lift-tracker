<template>
    <textarea class="title-input" v-model="value" @input="emitInput" v-bind:placeholder="placeholder"></textarea>
</template>

<script>
    export default {
        name: "TitleInput",
        props: {
            initialValue: {
                type: String,
                required: false,
            },
            placeholder: {
                type: String,
                required: false,
            },
        },
        data() {
            return {
                value: ''
            }
        },
        methods: {
            resizeTextarea (event) {
                // I have no idea why, but backspacing doesn't resize properly, so if it gets fully empty reset to single line.
                if (this.value.length === 0) {
                    event.target.style.height = '36px';
                }

                event.target.style.height = (event.target.scrollHeight) + 'px'
            },
            emitInput(e) {
                this.$emit('input', e);
            },
        },
        created() {
            if (this.initialValue) {
                this.value = this.initialValue;
            }
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
    .title-input {
        height: 36px;
        resize: none;
        font-size: 20px;
        min-width: 280px;
        margin: 10px;
        overflow-y: hidden;
        text-align: center;
    }

    .title-input:not(:focus) {
        border: none;
        background: none;
    }
</style>
