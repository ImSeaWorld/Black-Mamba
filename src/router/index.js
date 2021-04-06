import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
    },
    {
        path: '/log',
        name: 'Log',
        component: () => import('../views/Log.vue'),
    },
    {
        path: '/coin',
        name: 'Coin',
        component: () => import('../views/Coin.vue'),
    },
    {
        path: '/spa',
        name: 'SPABuilder',
        component: () => import('../views/SPABuilder.vue'),
    },
    {
        path: '/auctions',
        name: 'Auctions',
        component: () => import('../views/Auctions.vue'),
    },
    {
        path: '/marketplace',
        name: 'Marketplace',
        component: () => import('../views/Marketplace.vue'),
    },
];

const router = new VueRouter({
    routes,
});

export default router;
