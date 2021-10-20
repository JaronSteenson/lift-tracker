<template>
    <VContainer
        class="page-container fill-height"
        fluid
    >
        <LoginModal/>
    </VContainer>
</template>

<script>
import LoginModal from "../LoginModal";

export default {
        components: {
            LoginModal,
        },
    }
</script>

