<template>
    <NarrowContentContainer>
        <PageToolbar title="My account" :back-to="{ name: 'HomePage' }" />

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
                <a href="/privacy-policy">Read online</a>
            </VCardText>
        </VCard>

        <VCard>
            <VCardTitle>Permanently delete my account</VCardTitle>
            <VCardText>
                <p>
                    This will permanently delete all data associated with your
                    account, and is not reversible.
                </p>
                <p>
                    You will be prompted to login to Facebook again, doing so
                    confirms the deletion of your account.
                </p>
                <FacebookLoginDeleteAccountButton />
            </VCardText>
        </VCard>
    </NarrowContentContainer>
</template>

<script>
import PageToolbar from '../AppBar';
import FacebookLoginDeleteAccountButton from '../formFields/FacebookLoginDeleteAccountButton';
import ThemePicker from '../formFields/ThemePicker';
import NarrowContentContainer from '../layouts/NarrowContentContainer';

export default {
    components: {
        NarrowContentContainer,
        ThemePicker,
        PageToolbar,
        FacebookLoginDeleteAccountButton,
    },
};
</script>
