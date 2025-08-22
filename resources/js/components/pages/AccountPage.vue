<template>
    <NarrowContentContainer>
        <AppBar title="My account" :back-to="{ name: 'HomePage' }" />

        <VCard>
            <VCardTitle>Change theme</VCardTitle>
            <VCardText>
                Note: Themes are saved per device, rather than per account.
                <ThemePicker class="mt-2" />
            </VCardText>
        </VCard>

        <VCard>
            <VCardTitle>Privacy policy</VCardTitle>
            <VCardText>
                <RouterLink :to="{ name: 'PrivacyPolicy' }">
                    Read online
                </RouterLink>
            </VCardText>
        </VCard>

        <VCard>
            <VCardTitle>Permanently delete my account</VCardTitle>
            <VCardText>
                <p>
                    This will permanently delete all data associated with your
                    account, and is not reversible.
                </p>
                <VBtn
                    elevation="1"
                    v-if="userIsLocalOnly"
                    dark
                    color="red"
                    @click="deleteLocalData"
                >
                    Delete account
                </VBtn>
                <FacebookLoginDeleteAccountButton v-else />
            </VCardText>
        </VCard>
    </NarrowContentContainer>
</template>

<script>
import AppBar from '../AppBar';
import FacebookLoginDeleteAccountButton from '../formFields/FacebookLoginDeleteAccountButton';
import ThemePicker from '../formFields/ThemePicker';
import NarrowContentContainer from '../layouts/NarrowContentContainer';
import { useAppStore } from '../../stores/app';

export default {
    name: 'AccountPage',
    components: {
        NarrowContentContainer,
        ThemePicker,
        AppBar,
        FacebookLoginDeleteAccountButton,
    },
    setup() {
        const appStore = useAppStore();
        return { appStore };
    },
    computed: {
        userIsLocalOnly() {
            return this.appStore.userIsLocalOnly;
        },
    },
    methods: {
        deleteLocalData() {
            const confirmed = confirm(
                'Are you sure you want to delete your account?',
            );

            if (confirmed) {
                localStorage.clear();
                window.location.reload();
            }
        },
    },
};
</script>
