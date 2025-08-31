<template>
    <div>
        <AppBar />

        <div
            class="d-flex flex-wrap justify-center gap-4"
            :class="display.smAndUp.value ? 'mt-8' : 'mt-0'"
        >
            <div>
                <img
                    class="banner-image"
                    :class="{ 'banner-image--fade-in': fadeImageIn }"
                    src="images/phone-gym-floor.jpg"
                    alt="Banner image"
                    @load="handleImageLoad"
                    @error="handleImageError"
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
import { ref } from 'vue';

export default {
    name: 'LoginPage',
    components: { AppBar },
    setup() {
        const appStore = useAppStore();
        const display = useDisplay();
        const imageRef = ref(null);
        const fadeImageIn = ref(false);

        const handleImageLoad = () => {
            fadeImageIn.value = true;
        };

        const handleImageError = () => {
            fadeImageIn.value = true; // fallback if image fails
        };

        return {
            appStore,
            display,
            imageRef,
            fadeImageIn,
            handleImageLoad,
            handleImageError,
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
