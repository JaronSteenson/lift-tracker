<template>
    <div v-if="$vuetify.breakpoint.xsOnly" class="mt-5 d-flex justify-center">
        <div class="left-column d-flex flex-column justify-center align-center">
            <h1 class="heading heading--small mx-3">Super simple gym tracking</h1>
            <img
                ref="image"
                class="set-overview-demo set-overview-demo--small mt-5 elevation-5"
                :class="{ 'set-overview-demo--loaded': showImage }"
                src="images/set-overview.png"
                alt="Set overview"
            />
            <FacebookLoginButton class="mt-10"/>
            <a class="mt-3 d-block" href="/privacy-policy">Privacy policy</a>
        </div>
    </div>

    <div v-else class="container-large d-flex justify-center">
        <div class="left-column mr-5 d-flex flex-column justify-center align-center">
            <h1 class="heading">Super simple gym tracking</h1>
            <FacebookLoginButton class="mt-5"/>
            <a class="mt-3 d-block" href="/privacy-policy">Privacy policy</a>
        </div>
        <img
            ref="image"
            class="set-overview-demo set-overview-demo ml-5 elevation-5"
            :class="{ 'set-overview-demo--loaded': showImage }"
            src="images/set-overview.png"
            alt="Set overview"
        />
    </div>
</template>

<script>
import FacebookLoginButton from "../formFields/FacebookLoginButton";

export default {
        components: {
            FacebookLoginButton,
        },
        mounted() {
            this.$refs.image.onload = () => this.showImage = true;
        },
        data() {
            return {
                showImage: false,
            }
        }
    }
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

    $set-overview-demo-lg-scale: 0.6;
    height: calc(628px * #{$set-overview-demo-lg-scale});
    width: calc(374px * #{$set-overview-demo-lg-scale});

    &--small {
        height: calc(50vh);
        width: unset;
    }

    &--loaded {
        transition: opacity .5s ease-in;
        opacity: 1;
    }
}

</style>
