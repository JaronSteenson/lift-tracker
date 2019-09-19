<template>
    <div :class="'spinner-border ' + colorClass" role="status">
        <span class="sr-only">Loading...</span>
    </div>
</template>

<script>
    export default {
        name: 'LoadingSpinner',
        data() {
            return {
                colorClasses: ['text-primary', 'text-secondary', 'text-success'],
                currentColorClassIndex: 0,
            }
        },
        computed: {
            colorClass () {
                return this.colorClasses[this.currentColorClassIndex];
            }
        },
        mounted() {
            this.startColorToggling();
        },
        destroyed() {
            this.stopColorToggling();
        },
        methods: {
            startColorToggling() {
                this.colorToggling = setInterval(() => {
                    if (this.currentColorClassIndex < this.colorClasses.length) {
                        this.currentColorClassIndex++;
                    } else {
                        this.currentColorClassIndex = 0;
                    }
                }, 1000);
            },
            stopColorToggling() {
                clearTimeout(this.colorToggling);
            },
        }
    };
</script>
