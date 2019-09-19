<template>
    <div>
        <div class="spinner-border" :style="'color: ' + colorRgb" role="status">
            <span class="sr-only">Loading...</span>
        </div>
    </div>

</template>

<script>
    export default {
        name: 'LoadingSpinner',
        data() {
            return {
                red: 20,
                green: 200,
                blue: 100,
                colorChangeStepSize: 20,
                topBound: 200,
                lowerBound: 20,
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

                if (changedValue <= this.lowerBound) {
                    return this.colorChangeStepSize * 2;
                } else if (changedValue >= this.topBound) {
                    return this.topBound - this.colorChangeStepSize * 2;
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
                }, 250);
            },
            stopColorToggling() {
                clearTimeout(this.colorChanging);
            },
        }
    };
</script>
