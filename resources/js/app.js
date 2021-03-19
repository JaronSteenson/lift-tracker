import Vue from 'vue';
import store from './store';
import router from './router';
import vuetify from './vuetify';
import filters from './dates';
import App from './components/App.vue';

Object.keys(filters).forEach((name) => Vue.filter(name, filters[name]));

(async function () {
    const bodyDataset = document.querySelector('body').dataset;
    const appBoostrap = JSON.parse(bodyDataset.appBootstrap);

    delete bodyDataset.appBootstrap; // This should be only accessed via store/ajax now.

    await store.dispatch('app/directlyLoadAppBoostrap', appBoostrap);

    new Vue({
        store,
        router,
        vuetify,
        render: h => h(App),
    }).$mount('#app');
})();


