
/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */

import './bootstrap';

import Vue from 'vue';

/**
 * Next, we will create a fresh Vue application instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */

import TheMainContent from './components/TheMainContent.vue';
import TheCreateWorkoutProgramPage from './components/pages/TheCreateWorkoutProgramPage';

const vm = new Vue({
    el: '#js-lift-tracker-app',
    components: {
        'main-content': TheMainContent,
        'the-create-workout-program-form': TheCreateWorkoutProgramPage,
    },
});
