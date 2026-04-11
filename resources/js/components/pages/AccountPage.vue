<template>
    <NarrowContentContainer>
        <AppBar title="My account" :back-to="{ name: 'HomePage' }" />

        <VCard>
            <VCardTitle>Change theme</VCardTitle>
            <VCardText>
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
                <FacebookLoginDeleteAccountButton />
            </VCardText>
        </VCard>
    </NarrowContentContainer>
</template>

<script>
import AppBar from '../AppBar';
import FacebookLoginDeleteAccountButton from '../formFields/FacebookLoginDeleteAccountButton';
import ThemePicker from '../formFields/ThemePicker';
import NarrowContentContainer from '../layouts/NarrowContentContainer';
export default {
    name: 'AccountPage',
    components: {
        NarrowContentContainer,
        ThemePicker,
        AppBar,
        FacebookLoginDeleteAccountButton,
    },
};
</script>
