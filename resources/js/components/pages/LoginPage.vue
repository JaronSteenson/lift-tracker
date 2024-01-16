<template>
    <div>
        <AppBar />
        <div v-if="$vuetify.breakpoint.xsOnly" class="d-flex justify-center">
            <div
                class="left-column d-flex flex-column justify-center align-center"
            >
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
                <h1 class="heading heading--small mt-4">
                    The simplest way to track your lifts
                </h1>
                <div class="pa-2">
                    <LoginForm
                        v-if="showingLoginForm"
                        v-model="user"
                        class="full-page-form"
                        @showRegisterForm="showRegisterForm"
                    />
                    <RegisterForm
                        v-else-if="showRegisterForm"
                        v-model="user"
                        class="full-page-form"
                        @showLoginForm="showLoginForm"
                    />
                </div>
                <div class="d-flex justify-space-around">
                    <RouterLink
                        class="small-login-page-link pa-2 d-block"
                        :to="`/reset-password?email=${user.email}`"
                    >
                        Reset password
                    </RouterLink>
                    <RouterLink
                        class="small-login-page-link pa-2 d-block"
                        :to="{ name: 'PrivacyPolicy' }"
                    >
                        Privacy policy
                    </RouterLink>
                </div>
            </div>
        </div>
        <div
            v-else
            class="d-flex flex-wrap justify-center gap-4"
            :class="$vuetify.breakpoint.mdAndUp ? 'mt-16' : 'mt-8'"
        >
            <div>
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
                <LoginForm
                    v-if="showingLoginForm"
                    v-model="user"
                    class="full-page-form"
                    @showRegisterForm="showRegisterForm"
                />
                <RegisterForm
                    v-else-if="showRegisterForm"
                    v-model="user"
                    class="full-page-form"
                    @showLoginForm="showLoginForm"
                />
                <div class="d-flex justify-space-around">
                    <RouterLink
                        class="small-login-page-link pa-2 d-block"
                        :to="`/reset-password?email=${user.email}`"
                    >
                        Reset password
                    </RouterLink>
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
import LoginForm from '../domain/LoginForm';
import RegisterForm from '../domain/RegisterForm';

export default {
    components: {
        RegisterForm,
        LoginForm,
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
            showingLoginForm: true,
            showingRegisterForm: false,
            user: {
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                passwordConfirm: '',
            },
        };
    },
    methods: {
        showLoginForm() {
            this.showingLoginForm = true;
            this.showingRegisterForm = false;
        },
        showRegisterForm() {
            this.showingLoginForm = false;
            this.showingRegisterForm = true;
        },
    },
};
</script>

<style lang="scss" scoped>
$defaultThemeAppBarColor: #f5f5f5;

.heading {
    color: $defaultThemeAppBarColor;
    text-align: center;
    font-size: 1.8em;

    &--small {
        font-size: 1.3em;
    }
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
