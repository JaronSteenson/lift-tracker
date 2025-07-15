<template>
    <div>
        <AppBar />

        <div
            class="d-flex flex-wrap justify-center gap-4"
            :class="$vuetify.breakpoint.smAndUp ? 'mt-8' : 'mt-0'"
        >
            <div>
                <img
                    v-show="imageHasLoaded"
                    ref="image"
                    class="banner-image"
                    :class="{
                        'banner-image--fade-in': fadeImageIn,
                    }"
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
                <VBtn
                    class="mt-2"
                    color="secondary"
                    width="100%"
                    @click="login"
                >
                    Login
                </VBtn>
                <hr class="hr mt-4 mb-4" />
                <VBtn color="white" text small width="100%" @click="register">
                    Create an account
                </VBtn>
                <VBtn
                    class="mt-1"
                    color="primary"
                    text
                    small
                    width="100%"
                    @click="createLocalAccount"
                >
                    Get started without an account
                </VBtn>
                <div class="d-flex justify-space-around">
                    <RouterLink
                        class="small-login-page-link pa-2 d-block"
                        :to="{ name: 'PrivacyPolicy' }"
                    >
                        Privacy policy
                    </RouterLink>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import AppBar from '../AppBar';
import { mapActions, mapState } from 'vuex';

export default {
    components: {
        AppBar,
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
    computed: {
        ...mapState('app', ['auth0Client']),
    },
    methods: {
        ...mapActions('app', ['login', 'register', 'createLocalAccount']),
    },
};
</script>

<style lang="scss" scoped>
$defaultThemeAppBarColor: #f5f5f5;

.heading {
    color: $defaultThemeAppBarColor;
    text-align: center;
    font-size: 1.3em;

    &--small {
        font-size: 1em;
    }
}

.banner-image {
    opacity: 0;
    width: 100vw;

    @media (min-width: 600px) {
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

.hr {
    width: 100%;
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
