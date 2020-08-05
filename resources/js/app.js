import Vue from 'vue';
import store from './store';
import router from './router';
import vuetify from './vuetify';
import filters from './dates';
import App from './components/App.vue';

Object.keys(filters).forEach((name) => Vue.filter(name, filters[name]));

import Vue2Touch from 'vue2-touch'
Vue.use(Vue2Touch, {
    gestures: ['swipe'],
    swipeTolerance: 30,
    disableClick: true,
    directions: {
        swipe: ['swipeleft', 'swipeight'],
    },
})

new Vue({
    store,
    router,
    vuetify,
    render: h => h(App),
}).$mount('#app');
