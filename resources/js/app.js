import { createApp } from 'vue';
import { pinia } from './stores';
import router from './router/router';
import { createVuetify, svgIcons } from './vuetify';
import initRollbar from './rollbar/rollbar';
import App from './components/App.vue';
import { useAppStore } from './stores/app';
import './app-custom-v3.css';
import initNewRelic from './newRelic/newRelic';

(async function () {
    initNewRelic();
    initRollbar();

    if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.register('/service-worker.js');
    }

    const app = createApp(App);

    app.use(pinia);
    app.use(router);
    app.use(createVuetify());

    // Make SVG icons available globally as $svgIcons
    app.config.globalProperties.$svgIcons = svgIcons;

    // Bootstrap the app store after pinia is initialized
    const appStore = useAppStore();
    await appStore.bootstrap();

    app.mount('#app');
})();
