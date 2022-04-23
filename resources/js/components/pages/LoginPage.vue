<template>
    <div v-if="$vuetify.breakpoint.xsOnly" class="mt-5 d-flex justify-center">
        <div class="left-column d-flex flex-column justify-center align-center">
            <h1 class="heading heading--small mx-3">
                Super simple gym tracking
            </h1>
            <img
                v-show="imageHasLoaded"
                ref="image"
                class="set-overview-demo set-overview-demo--small mt-5 elevation-5"
                :class="{
                    'set-overview-demo--fade-in': fadeImageIn,
                }"
                src="images/set-overview.png"
                alt="Set overview"
            />
            <VSkeletonLoader
                v-if="!imageHasLoaded"
                class="set-overview-demo-skeleton-small mt-5"
                type="image"
            />
            <FacebookLoginButton class="mt-10" />
            <a class="mt-3 d-block" href="/privacy-policy">Privacy policy</a>
        </div>
    </div>

    <div v-else class="container-large d-flex justify-center">
        <div
            class="left-column mr-5 d-flex flex-column justify-center align-center"
        >
            <h1 class="heading">Super simple gym tracking</h1>
            <FacebookLoginButton class="mt-5" />
            <a class="mt-3 d-block" href="/privacy-policy">Privacy policy</a>
        </div>
        <img
            v-show="imageHasLoaded"
            ref="image"
            class="set-overview-demo ml-5 elevation-5"
            :class="{ 'set-overview-demo--fade-in': fadeImageIn }"
            src="images/set-overview.png"
            alt="Set overview"
        />
        <VSkeletonLoader
            v-if="!imageHasLoaded"
            class="set-overview-demo-skeleton ml-5"
            type="image"
        />
    </div>
</template>

<script>
import FacebookLoginButton from '../formFields/FacebookLoginButton';

export default {
    components: {
        FacebookLoginButton,
    },
    mounted() {
        this.$refs.image.onload = () => (this.imageHasLoaded = true);
        setTimeout(() => (this.fadeImageIn = true), 100);
    },
    data() {
        return {
            imageHasLoaded: false,
            fadeImageIn: false,
        };
    },
};
</script>

<style lang="scss" scoped>
.container-large {
    margin-top: 15vh;
}

.left-column {
    max-width: 400px;
}

.heading {
    text-align: center;
    font-size: 3em;

    &--small {
        font-size: 1.8em;
    }
}

.set-overview-demo {
    opacity: 0;
    border-radius: 5px;
    height: calc(315px);
    width: calc(188px);

    &--small {
        height: 50vh;
        width: unset;
    }

    &--fade-in {
        transition: opacity 0.5s ease-in;
        opacity: 1;
    }
}
</style>

<style lang="scss">
.set-overview-demo-skeleton .v-skeleton-loader__image.v-skeleton-loader__bone {
    height: calc(315px);
    width: calc(188px);
}

.set-overview-demo-skeleton-small
    .v-skeleton-loader__image.v-skeleton-loader__bone {
    height: 50vh;
    width: 30vh;
}
</style>
