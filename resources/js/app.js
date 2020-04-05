import Vue from 'vue';
import VueRouter from 'vue-router';
import Vuex from 'vuex'

import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'

import App from './components/App.vue';
import store from './store';
import router from './router';

Vue.use(Vuetify);
Vue.use(Vuex);
Vue.use(VueRouter);

const vuetify = new Vuetify();

new Vue({
    store,
    router,
    vuetify,
    render: h => h(App),
}).$mount('#app');
