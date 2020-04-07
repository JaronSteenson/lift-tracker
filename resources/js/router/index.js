import Vue from 'vue'
import HomePage from "../components/pages/HomePage";
import LoginPage from "../components/pages/LoginPage";
import ProgramBuilderPage from "../components/pages/ProgramBuilderPage";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
    {
        name: 'home',
        path: '/',
        component: HomePage
    },
    {
        name: 'login',
        path: '/login',
        component: LoginPage,
    },
    {
        name: 'newProgramBuilder',
        path: '/program-builder',
        component: ProgramBuilderPage,
        props: true
    },
    {
        name: 'programBuilder',
        path: '/program-builder/:workoutProgramUuid',
        component: ProgramBuilderPage,
        props: true
    },
];

export default new VueRouter({
    routes,
    mode: 'history',
});
