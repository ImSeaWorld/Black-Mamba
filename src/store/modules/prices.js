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

const state = { status: 'N/A', prices: {}, coins: [], wsConnection: undefined };

const getters = {
    getCoins: (state) => state.coins,
    getPrices: (state) => state.prices,
    getConnection: (state) => state.wsConnection,
};

const actions = {
    [CONNECT]: ({ commit, dispatch, getters }) => {
        commit(CONNECTING);

        var connection = getters.getConnection;
        if (!connection) {
            var coins = getters.getCoins;
            connection = new WebSocket(
                'wss://ws.coincap.io/prices?assets=bitcoin,handshake' +
                    (coins.length > 0 ? ',' : '') +
                    [...coins].join(','),
            );
        }

        connection.onopen = () => {
            commit(CONNECTED, connection);
        };

        connection.onclose = (event) => {
            console.error(event);
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
    [DISCONNECT]: ({ commit, getters }) => {
        getters.getConnection.close();
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
        state.status = 'connected';
        state.wsConnection = connection;
    },
    [CONNECTING]: (state) => {
        state.status = 'connecting';
    },
    [DISCONNECTED]: (state) => {
        state.status = 'disconnected';
        state.wsConnection = false;
    },
    [CLOSED]: (state) => {
        state.status = 'closed';
    },
    [WATCH_COIN]: (state, coin) => {
        state.status = 'adding-watcher';
        Vue.set(state.coins, state.coins.length, coin);
    },
    [UPDATED]: (state, { coin, price }) => {
        state.status = 'updated';
        Vue.set(state.prices, coin, price);
    },
};

export default {
    state,
    getters,
    actions,
    mutations,
};
