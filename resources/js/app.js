import Vue from 'vue';
import store from './store';
import router from './router/router';
import createVuetify from './vuetify';
import App from './components/App.vue';

(async function () {
    if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.register('/service-worker.js');
    }

    await store.dispatch('app/boostrap');

    new Vue({
        store,
        router,
        vuetify: createVuetify(),
        render: (h) => h(App),
    }).$mount('#app');
})();
