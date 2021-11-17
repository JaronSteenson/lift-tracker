<template>
    <div class="wrap">
        <div v-if="$vuetify.breakpoint.xsOnly" class="mt-5 d-flex justify-center">
            <div class="left-column d-flex flex-column justify-center align-center">
                <h1 class="heading heading--small mx-3">Super simple gym tracking</h1>
                <img
                    class="set-overview-demo set-overview-demo--small mt-5 elevation-5"
                    src="images/set-overview.png"
                    alt="Set overview"
                />
                <FacebookLoginButton class="mt-10"/>
                <a class="mt-3 d-block" href="/privacy-policy">Privacy policy</a>
            </div>
        </div>

        <div v-else class="mt-15 d-flex justify-center">
            <div class="left-column mr-5 d-flex flex-column justify-center align-center">
                <h1 class="heading">Super simple gym tracking</h1>
                <FacebookLoginButton class="mt-5"/>
                <a class="mt-3 d-block" href="/privacy-policy">Privacy policy</a>
            </div>
            <img
                class="set-overview-demo set-overview-demo ml-5 elevation-5"
                src="images/set-overview.png"
                alt="Set overview"
            />
        </div>
    </div>
</template>

<script>
import FacebookLoginButton from "../formFields/FacebookLoginButton";

export default {
        components: {
            FacebookLoginButton,
        },
    }
</script>

<style lang="scss" scoped>
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
    border-radius: 5px;

    $set-overview-demo-lg-scale: 0.6;
    height: calc(628px * #{$set-overview-demo-lg-scale});
    width: calc(374px * #{$set-overview-demo-lg-scale});

    &--small {
        height: calc(50vh);
        width: unset;
    }
}

</style>
