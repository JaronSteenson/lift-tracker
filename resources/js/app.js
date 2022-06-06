import Vue from 'vue';
import store from './store';
import ApiService from './api/ApiService';
import router from './router';
import vuetify from './vuetify';
import App from './components/App.vue';

(async function () {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js');
    }

    // This cannot just live in ApiService, or we end up with circular imports.
    ApiService.registerResponseInterceptor(
        async (response) => {
            await store.dispatch('app/extendSessionExpiry');

            return response;
        },
        async (error) => {
            if (error.request.status === 401) {
                await store.dispatch('app/expireSession');
                return Promise.resolve(error);
            }

            return Promise.reject(error);
        }
    );

    await store.dispatch('app/boostrap');

    new Vue({
        store,
        router,
        vuetify,
        render: (h) => h(App),
    }).$mount('#app');
})();
