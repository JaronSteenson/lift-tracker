import { createApp } from 'vue';
import router from './router/router';
import { createVuetify, svgIcons } from './vuetify';
import App from './components/App.vue';
import 'vuetify/dist/vuetify.css';
import './app.css';
import initNewRelic from './newRelic/newRelic';
import { VueQueryPlugin } from '@tanstack/vue-query';
import {
    createLiftTrackerQueryClient,
    setSharedQueryClient,
} from './queryClient';
import { bootstrapAuth } from './components/domain/auth/composables/useAuth';

(async function () {
    initNewRelic();

    if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.register('/service-worker.js');
    }

    const app = createApp(App);

    const queryClient = createLiftTrackerQueryClient();
    setSharedQueryClient(queryClient);

    app.use(VueQueryPlugin, { queryClient });
    app.use(router);
    app.use(createVuetify());

    // Make SVG icons available globally as $svgIcons
    app.config.globalProperties.$svgIcons = svgIcons;

    await bootstrapAuth();

    app.mount('#app');
})();
