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
                    {{ avatarInitial }}
                </VAvatar>
            </VBtn>
        </template>
        <VList>
            <VListItem :to="{ name: 'AccountPage' }">
                <VListItemTitle>My account</VListItemTitle>
            </VListItem>
            <VListItem @click="logout">
                <VListItemTitle>Logout</VListItemTitle>
            </VListItem>
        </VList>
    </VMenu>
</template>
<script>
import { mapGetters } from 'vuex';

export default {
    computed: {
        ...mapGetters('app', {
            avatarInitial: 'getUserAvatarInitial',
            userIsAuthenticated: 'userIsAuthenticated',
        }),
    },
    methods: {
        async logout() {
            if (!this.userIsAuthenticated) {
                await this.$router.push({ name: 'LoginPage' });
                return;
            }

            await this.$store.dispatch('app/logout');
            await this.$router.push({ name: 'LoginPage' });
        },
    },
};
</script>
<style lang="scss"></style>
