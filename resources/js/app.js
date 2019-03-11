
/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */

require('./bootstrap');

window.Vue = require('vue');

/**
 * Next, we will create a fresh Vue application instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */

const theMainContent =  require('./components/TheMainContent.vue');
const TheCreateWorkoutProgramPage =  require('./pages/TheCreateWorkoutProgramPage');

const vm = new Vue({
    el: '#js-lift-tracker-app',
    components: {
        'main-content': theMainContent,
        'the-create-workout-program-form': TheCreateWorkoutProgramPage,
    },
});
