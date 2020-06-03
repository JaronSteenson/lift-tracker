import Vue from 'vue';
import store from './store';
import router from './router';
import vuetify from './vuetify';
import filters from './filters';
import App from './components/App.vue';

Object.keys(filters).forEach((name) => Vue.filter(name, filters[name]));

new Vue({
    store,
    router,
    vuetify,
    render: h => h(App),
}).$mount('#app');
