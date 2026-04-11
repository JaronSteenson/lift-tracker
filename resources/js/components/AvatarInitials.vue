<template>
    <VMenu
        v-if="userIsAuthenticated"
        transition="slide-y-transition"
        bottom
        offset-y
    >
        <template v-slot:activator="{ props }">
            <VBtn icon v-bind="props">
                <VAvatar color="secondary" :size="32">
                    {{ user.name.charAt(0).toUpperCase() }}
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
import { useAuth } from './domain/auth/composables/useAuth';

export default {
    name: 'AvatarInitials',
    setup() {
        const { user, userIsAuthenticated, logout: performLogout } = useAuth();
        return { user, userIsAuthenticated, performLogout };
    },
    methods: {
        async logout() {
            if (!this.userIsAuthenticated) {
                await this.$router.push({ name: 'LoginPage' });
                return;
            }

            await this.performLogout();
        },
    },
};
</script>
<style lang="scss"></style>
