<template>
    <div>
        <PageToolbar :back-to="{ name: 'HomePage' }" />
        <NotFound>
            <slot> Sorry we couldn't find the page you are after. </slot>
        </NotFound>
    </div>
</template>

<script>
import NotFound from '../routing/NotFound';
import PageToolbar from '../layouts/PageToolbar';

export default {
    components: {
        PageToolbar,
        NotFound,
    },
};
</script>
