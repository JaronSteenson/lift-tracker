<template>
    <VMenu
        v-if="userIsAuthenticated"
        transition="slide-y-transition"
        bottom
        offset-y
    >
        <template v-slot:activator="{ on }">
            <VBtn icon v-on="on">
                <VAvatar color="secondary" :size="32">
                    {{ avatarInitials }}
                </VAvatar>
            </VBtn>
        </template>
        <VList>
            <VListItem :to="{ name: 'AccountPage' }">
                <VListItemTitle>My account</VListItemTitle>
            </VListItem>
            <VListItem v-if="!userIsLocalOnly" @click="logout">
                <VListItemTitle>Logout</VListItemTitle>
            </VListItem>
        </VList>
    </VMenu>
</template>
<script>
import { mapGetters } from "vuex";

export default {
    computed: {
        ...mapGetters("app", [
            "avatarInitials",
            "userIsAuthenticated",
            "userIsLocalOnly",
        ]),
    },
    methods: {
        async logout() {
            if (!this.userIsAuthenticated) {
                await this.$router.push({ name: "LoginPage" });
                return;
            }

            await this.$store.dispatch("app/logout");
            await this.$router.push({ name: "LoginPage" });
        },
    },
};
</script>
<style lang="scss"></style>
