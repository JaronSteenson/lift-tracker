import Vue from 'vue';
import store from './store';
import router from './router';
import vuetify from './vuetify';
import App from './components/App.vue';

new Vue({
    store,
    router,
    vuetify,
    render: h => h(App),
}).$mount('#app');
