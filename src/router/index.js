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
    /*{
        path: '/boyses',
        name: 'Boyses',
        component: () => import('../views/boyses.vue'),
    },*/
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
    {
        path: '/about',
        name: 'About',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
            import(/* webpackChunkName: "about" */ '../views/About.vue'),
    },
];

const router = new VueRouter({
    routes,
});

export default router;
