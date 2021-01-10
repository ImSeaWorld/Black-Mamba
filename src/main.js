import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';
import './quasar';
import moment from 'moment';

Vue.config.productionTip = false;

moment.updateLocale('en', {
    relativeTime: {
        future: 'in %s',
        past: '%s ago',
        s: 'a few seconds',
        ss: '%d seconds',
        m: 'a minute',
        mm: '%d minutes',
        h: 'an hour',
        hh: '%d hours',
        d: 'a day',
        dd: '%d days',
        w: 'a week',
        ww: '%d weeks',
        M: 'a month',
        MM: '%d months',
        y: 'a year',
        yy: '%d years',
    },
});
Vue.use(require('vue-moment'), { moment });

Vue.mixin({
    computed: {
        formatCurrency() {
            return (currency, dollar) => {
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: currency,
                }).format(dollar);
            };
        },
        dd2hns() {
            return (dd) => dd / 1000000;
        },
        hns2dd() {
            return (hns) => hns * 1000000;
        },
    },
    methods: {
        isDarkRadial(input, light, dark, ratio = 125) {
            // remove the hash
            input = input.replace('#', '');

            if (!input.match(/\#?([a-fA-F0-9]){6}/i)) {
                console.error(input);
            }

            // Get hex values to decimal
            let rgb = {
                r: parseInt(input.slice(0, 2), 16),
                g: parseInt(input.slice(2, 4), 16),
                b: parseInt(input.slice(4, 6), 16),
            };

            // Calculate brightness
            let brightness = Math.round(
                (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000,
            );

            return brightness > ratio ? dark : light;
        },
    },
});

new Vue({
    router,
    store,
    render: (h) => h(App),
}).$mount('#app');
