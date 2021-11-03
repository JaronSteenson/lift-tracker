<template>
    <div class="narrow-content-container">
        <div class="narrow-content-container__content">
            <slot/>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    .narrow-content-container {
        display: flex;
        justify-content: center;
        margin: 20px 10px 30px;

        &__content {
             width: 700px;
         }
    }
</style>
