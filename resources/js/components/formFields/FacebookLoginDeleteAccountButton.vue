<template>
    <VBtn color="red" dark @click="logout"> Yes delete my account </VBtn>
</template>

<script>
import { mapActions } from 'vuex';

export default {
    data() {
        return {
            loading: false,
        };
    },
    methods: {
        ...mapActions('app', ['logout']),
    },
};
</script>
