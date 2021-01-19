import Vue from 'vue';
import {
    CONNECT,
    CLOSED,
    DISCONNECT,
    UPDATE_PRICE,
    UPDATED,
    WATCH_COIN,
    CONNECTING,
    CONNECTED,
    DISCONNECTED,
} from '../actions/prices';

const state = {
    prices: {
        coins: [],
        prices: {},
        status: 'N/A',
        lasttimestamp: false,
        wsConnection: undefined,
    },
};

const getters = {
    getCoins: (state) => state.prices.coins,
    getCoinPrices: (state) => state.prices.prices,
    getPrices: (state) => state.prices,
    priceStatus: (state) => state.prices.status,
    getConnection: (state) => state.prices.wsConnection,
};

const actions = {
    [CONNECT]: ({ commit, dispatch, getters }) => {
        commit(CONNECTING);

        var coins = getters.getCoins;
        var connection = new WebSocket(
            'wss://ws.coincap.io/prices?assets=bitcoin,handshake' +
                (coins.length > 0 ? ',' : '') +
                [...coins].join(','),
        );

        connection.onopen = () => {
            commit(CONNECTED, connection);
        };

        connection.onclose = (event) => {
            commit(CLOSED);
        };

        connection.onmessage = (event) => {
            var data = JSON.parse(event.data);

            for (var coin in data) {
                dispatch(UPDATE_PRICE, {
                    coin: coin,
                    price: data[coin],
                });
            }
        };
    },
    [DISCONNECT]: ({ commit }) => {
        commit(DISCONNECTED);
    },
    [WATCH_COIN]: ({ commit, dispatch }, id) => {
        commit(WATCH_COIN, id);
        dispatch(DISCONNECT);
        dispatch(CONNECT);
    },
    [UPDATE_PRICE]: ({ commit }, coin, amount) => {
        commit(UPDATED, coin, amount);
    },
};

const mutations = {
    [CONNECTED]: (state, connection) => {
        state.prices.status = 'connected';
        state.prices.wsConnection = connection;
    },
    [CONNECTING]: (state) => {
        state.prices.status = 'connecting';
    },
    [DISCONNECTED]: (state) => {
        state.prices.wsConnection.close();
    },
    [CLOSED]: (state) => {
        state.prices.status = 'closed';
    },
    [WATCH_COIN]: (state, coin) => {
        state.prices.status = 'adding-watcher';
        Vue.set(state.prices.coins, state.prices.coins.length, coin);
    },
    [UPDATED]: (state, { coin, price }) => {
        state.prices.status = 'updated';
        Vue.set(state.prices.prices, coin, price);
        state.prices.lasttimestamp = new Date().getTime();
    },
};

export default {
    state,
    getters,
    actions,
    mutations,
};
