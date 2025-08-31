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
                    {{ appStore.user.name.charAt(0).toUpperCase() }}
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
import { useAppStore } from '../stores/app';

export default {
    name: 'AvatarInitials',
    setup() {
        const appStore = useAppStore();
        return { appStore };
    },
    computed: {
        userIsAuthenticated() {
            return this.appStore.userIsAuthenticated;
        },
        userIsLocalOnly() {
            return this.appStore.userIsLocalOnly;
        },
    },
    methods: {
        async logout() {
            if (!this.userIsAuthenticated) {
                await this.$router.push({ name: 'LoginPage' });
                return;
            }

            await this.appStore.logout();
        },
    },
};
</script>
<style lang="scss"></style>
