<template>
    <NarrowContentContainer>
        <PageToolbar title="My account" :back-to="{ name: 'HomePage' }" />

        <h2>Change theme</h2>
        <p>Note: Themes are saved per device, rather than per account.</p>
        <ThemePicker class="mt-10" />

        <hr class="mt-10" />

        <h2 class="mt-10">Privacy policy</h2>
        <p>
            <a href="/privacy-policy">Read online</a>
        </p>

        <hr class="mt-10" />

        <h2 class="mt-10">Permanently delete my account</h2>
        <p>
            This will permanently delete all data associated with your account,
            and is not reversible.
        </p>
        <p>
            You will be prompted to login to Facebook again, doing so confirms
            the deletion of your account.
        </p>
        <FacebookLoginDeleteAccountButton />
    </NarrowContentContainer>
</template>

<script>
import PageToolbar from '../layouts/PageAppBar';
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
