<template>
    <div v-if="$vuetify.breakpoint.xsOnly" class="d-flex justify-center">
        <div class="left-column d-flex flex-column justify-center align-center">
            <img
                v-show="imageHasLoaded"
                ref="image"
                class="banner-image banner-image--small"
                :class="{
                    'banner-image--fade-in': fadeImageIn,
                }"
                src="images/phone-gym-floor.jpg"
                alt="Banner image"
            />
            <VSkeletonLoader
                v-if="!imageHasLoaded"
                class="banner-image-skeleton-small"
                type="image"
            />
            <h1 class="heading heading--small mt-15">
                The simplest way to track your lifts
            </h1>
            <div class="login-container mt-15 pa-2">
                <FacebookLoginButton />
            </div>
            <a class="privacy-policy mt-10 d-block" href="/privacy-policy">
                Privacy policy
            </a>
        </div>
    </div>

    <div class="container-large" v-else>
        <div class="d-flex flex-wrap justify-center">
            <div class="mx-15">
                <img
                    v-show="imageHasLoaded"
                    ref="image"
                    class="banner-image banner-image--large"
                    :class="{ 'banner-image--fade-in': fadeImageIn }"
                    src="images/phone-gym-floor.jpg"
                    alt="Banner image"
                />
                <VSkeletonLoader
                    v-if="!imageHasLoaded"
                    class="banner-image-skeleton"
                    type="image"
                />
            </div>
            <div class="mx-15 d-flex flex-column justify-center align-center">
                <h1 class="heading">The simplest way to track your lifts</h1>
                <div class="login-container mt-15 pa-2">
                    <FacebookLoginButton />
                </div>
                <a class="privacy-policy mt-5 d-block" href="/privacy-policy">
                    Privacy policy
                </a>
            </div>
        </div>
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
$defaultThemeAppBarColor: #f5f5f5;

.container-large {
    margin-top: 15vh;
}

.heading {
    color: $defaultThemeAppBarColor;
    text-align: center;
    font-size: 1.8em;

    &--small {
        font-size: 1.3em;
    }
}

.login-container {
    background-color: $defaultThemeAppBarColor;
    border-radius: 5px;
}

.privacy-policy {
    color: $defaultThemeAppBarColor !important;
    font-size: 0.8em;
}

.banner-image {
    opacity: 0;

    &--small {
        height: unset;
        width: 100vw;
        border-bottom: 8px solid $defaultThemeAppBarColor;
    }

    &--large {
        height: 260px;
        width: 390px;
        border: 8px solid $defaultThemeAppBarColor;
        border-radius: 5px;
    }

    &--fade-in {
        transition: opacity 0.5s ease-in;
        opacity: 1;
    }
}
</style>

<style lang="scss">
.banner-image-skeleton .v-skeleton-loader__image.v-skeleton-loader__bone {
    height: 260px;
    width: 390px;
}

.banner-image-skeleton-small .v-skeleton-loader__image.v-skeleton-loader__bone {
    height: calc(100vw * 0.666);
    width: 100vw;
}
</style>
