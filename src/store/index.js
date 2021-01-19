import Vue from 'vue';
import Vuex from 'vuex';

import prices from './modules/prices';
import namebase from './modules/namebase';
import flatfile from './modules/flatfile';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {},
    mutations: {},
    actions: {},
    modules: {
        prices,
        namebase,
        flatfile,
    },
});
