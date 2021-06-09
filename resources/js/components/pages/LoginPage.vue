<template>
    <VContainer
        class="page-container fill-height"
        :class="!this.$vuetify.breakpoint.xs ? 'page-container--fake-overlay' : ''"
        fluid
    >
        <VRow
            align="center"
            justify="center"
        >
            <VCol
                cols="12"
                md="4"
                sm="8"
            >
                <VCard
                    class="login-card"
                    :class="$vuetify.breakpoint.xs ? 'elevation-0' : 'elevation-20'"
                    :loading="!$vuetify.breakpoint.xs && loading"
                >
                    <VCardTitle class="justify-center">
                        Please login to continue
                    </VCardTitle>
                    <VCardText class="login-card__body" :class="{ 'pa-0': this.$vuetify.breakpoint.xs }" text-alight="center">
                        <FacebookLoginButton @click="loading = true" :loading="loading"/>
                    </VCardText>
                </VCard>
            </VCol>
        </VRow>
    </VContainer>
</template>

<script>
    import FacebookLoginButton from "../formFields/FacebookLoginButton";

    export default {
        components: {
            FacebookLoginButton,
        },
        props: {
            initialEmail: String,
            initialPassword: String,
        },
        data() {
            return {
                loading: false,
            }
        },
    }
</script>

<style lang="scss" scoped>
    $animation-time: 0.75s;

    .page-container {
        transition: background-color $animation-time;

        &--fake-overlay {
            transition: background-color $animation-time;
            // Copied from the vuetify modal overlay (computed from color and opacity, not actual css value).
            background-color: rgb(153 153 153);
        }
    }

    .login-card {
        // Controlled by elevation-0 and elevation-20.
        transition: box-shadow $animation-time;

        &__body {
            display: flex;
            min-height: 150px;
            align-items: center;
            justify-content: center;
        }
    }
</style>
