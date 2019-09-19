<template>
    <div class="spinner-border" :style="'color: ' + colorRgb" role="status">
        <span class="sr-only">Loading...</span>
    </div>
</template>

<script>
    export default {
        name: 'LoadingSpinner',
        data() {
            return {
                red: 22,
                green: 22,
                blue: 22,
                colorChangeStepSize: 20,
            }
        },
        computed: {
            colorRgb () {
                return `rgb(${this.red}, ${this.green}, ${this.blue})`
            }
        },
        mounted() {
            this.startColorToggling();
        },
        destroyed() {
            this.stopColorToggling();
        },
        methods: {
            safeRgbChange(currentValue) {
                const change = Math.random() >= 0.5 ? this.colorChangeStepSize : -this.colorChangeStepSize;

                var changedValue = currentValue + change;

                if (changedValue <= 1) {
                    return this.colorChangeStepSize;
                } else if (changedValue >= 255) {
                    return 255 - this.colorChangeStepSize;
                }

                return changedValue;
            },
            startColorToggling() {
                this.colorChanging = setInterval(() => {
                    const partToChange = Math.floor(Math.random() * 3);

                    switch (partToChange) {
                        case 0:
                            this.red = this.safeRgbChange(this.red);
                            break;
                        case 1:
                            this.green = this.safeRgbChange(this.green);
                            break;
                        case 2:
                            this.blue = this.safeRgbChange(this.blue);
                            break;
                    }
                }, 100);
            },
            stopColorToggling() {
                clearTimeout(this.colorChanging);
            },
        }
    };
</script>
