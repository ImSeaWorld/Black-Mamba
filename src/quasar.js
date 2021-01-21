import Vue from 'vue';

import './styles/quasar.scss';
import iconSet from 'quasar/icon-set/mdi-v4.js';
import '@quasar/extras/roboto-font/roboto-font.css';
import '@quasar/extras/mdi-v4/mdi-v4.css';
import { Quasar, Notify } from 'quasar';
import qOverlay from '@quasar/quasar-ui-qoverlay';
import '@quasar/quasar-ui-qoverlay/dist/index.css';

Vue.use(qOverlay);

Vue.use(Quasar, {
    config: {
        dark: true,
    },
    plugins: {
        Notify,
    },
    iconSet: iconSet,
});
