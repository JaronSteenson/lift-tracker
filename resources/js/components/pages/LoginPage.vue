<template>
    <div>
        <AppBar />

        <div
            class="d-flex flex-wrap justify-center gap-4"
            :class="display.smAndUp.value ? 'mt-8' : 'mt-0'"
        >
            <div>
                <img
                    v-show="imageHasLoaded"
                    ref="imageRef"
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
                    elevation="1"
                    class="mt-2"
                    color="secondary"
                    width="100%"
                    @click="login"
                >
                    Login
                </VBtn>
                <hr class="hr mt-4 mb-4" />
                <VBtn
                    elevation="1"
                    variant="text"
                    small
                    width="100%"
                    @click="register"
                >
                    Create an account
                </VBtn>
                <VBtn
                    elevation="1"
                    class="mt-1"
                    color="primary"
                    variant="text"
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
import { useAppStore } from '../../stores/app';
import { useDisplay } from 'vuetify';
import { ref, onMounted, nextTick } from 'vue';

export default {
    name: 'LoginPage',
    components: {
        AppBar,
    },
    setup() {
        const appStore = useAppStore();
        const display = useDisplay();
        const imageRef = ref(null);
        const imageHasLoaded = ref(false);
        const fadeImageIn = ref(false);

        const handleImageLoad = () => {
            imageHasLoaded.value = true;
            // Force a microtask delay to ensure DOM updates
            nextTick(() => {
                requestAnimationFrame(() => {
                    fadeImageIn.value = true;
                });
            });
        };

        onMounted(() => {
            if (imageRef.value) {
                // Check if image is already loaded (cached)
                if (
                    imageRef.value.complete &&
                    imageRef.value.naturalHeight !== 0
                ) {
                    handleImageLoad();
                } else {
                    imageRef.value.onload = handleImageLoad;
                    // Also handle error case to prevent hanging
                    imageRef.value.onerror = () => {
                        imageHasLoaded.value = true; // Still show something if image fails
                    };
                }
            }
        });

        return {
            appStore,
            display,
            imageRef,
            imageHasLoaded,
            fadeImageIn,
        };
    },
    computed: {
        auth0Client() {
            return this.appStore.auth0Client;
        },
    },
    methods: {
        async login() {
            await this.appStore.login();
        },
        async register() {
            await this.appStore.register();
        },
        async createLocalAccount() {
            await this.appStore.createLocalAccount();
        },
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
        opacity: 1 !important;
        transition: opacity 0.9s ease-in-out !important;
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
