<template>
    <VContainer class="text-center" fluid>
        <VRow justify="center">
            <VCol cols="12">
                <div :style="'color: ' + colorRgb" class="spinner-border" role="status">
                    <h2>Loading...</h2>
                </div>
            </VCol>
        </VRow>
    </VContainer>
</template>

<script>
    export default {
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
            colorRgb() {
                return `rgb(${this.red}, ${this.green}, ${this.blue})`
            }
        },
        mounted() {
            this.randomizeStartingColors();
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
            randomizeStartingColors() {
                const predefinedStartColor = Math.floor(Math.random() * 3);

                switch (predefinedStartColor) {
                    case 0:
                        this.red = 20;
                        this.green = 200;
                        this.blue = 100;
                        break;
                    case 1:
                        this.red = 100;
                        this.green = 20;
                        this.blue = 200;
                        break;
                    case 2:
                        this.red = 20;
                        this.green = 100;
                        this.blue = 200;
                        break;
                }
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
