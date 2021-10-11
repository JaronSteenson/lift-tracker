<template>
    <VContainer
        class="page-container"
        fluid
    >
        <VRow
            justify="center"
        >
            <VCol
                cols="12"
                md="4"
                sm="8"
            >
                <VCardTitle class="justify-center">
                    Permanently delete my account
                </VCardTitle>
                <p>
                    This will permanently delete all data associated with your account, and is not reversible.
                </p>
                <p>
                    You will be prompted to login to Facebook again, doing so confirms the deletion of your account.
                </p>
                <div class="text-center">
                    <FacebookLoginDeleteAccountButton/>
                </div>
            </VCol>
        </VRow>
    </VContainer>
</template>

<script>
    import FacebookLoginDeleteAccountButton from "../formFields/FacebookLoginDeleteAccountButton";

    export default {
        components: {
            FacebookLoginDeleteAccountButton,
        },
    }
</script>
