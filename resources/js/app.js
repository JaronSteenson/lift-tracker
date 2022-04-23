import Vue from 'vue';
import store from './store';
import ApiService from './api/ApiService';
import router from './router';
import vuetify from './vuetify';
import App from './components/App.vue';

(async function () {
    const bodyDataset = document.querySelector('body').dataset;
    const appBoostrap = JSON.parse(bodyDataset.appBootstrap);

    delete bodyDataset.appBootstrap; // This should be only accessed via store/ajax now.

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

    await store.dispatch('app/directlyLoadAppBoostrap', appBoostrap);

    new Vue({
        store,
        router,
        vuetify,
        render: (h) => h(App),
    }).$mount('#app');
})();
