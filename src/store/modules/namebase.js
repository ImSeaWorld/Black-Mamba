import Vue from 'vue';
import NameBase from 'namebasejs';
import {
    LOGIN,
    GET_DOMAINS,
    UPDATE_INFO,
    GET_DASHBOARD,
    UPDATE_BALANCE,
    LOGGED_IN,
    SET_HEIGHT,
    SET_BALANCE,
    SET_DOMAINS,
    FAILED_LOGIN,
    SERVER_ERROR,
    NOT_LOGGED_IN,
    SET_LOCKEDHNS,
    SESSION_EXPIRED,
} from '../actions/namebase';

const state = {
    height: 0,
    namebase: false,
    lockedHns: 0, // dollarydoos
    hnsbalance: 0,
    usdbalance: 0,
    date: false,
    domains: {
        listed: [],
        notlisted: [],
        transferred: [],
    },
    session: false,
    accState: 'not-logged-in',
};

const getters = {
    height: (state) => state.height,
    session: (state) => state.session,
    namebase: (state) => state.namebase,
    lockedHns: (state) => state.lockedHns,
    usdBalance: (state) => state.usdbalance,
    hnsBalance: (state) => state.hnsbalance,
    listedDomains: (state) => state.domains.listed,
    notlistedDomains: (state) => state.domains.notlisted,
    transferredDomains: (state) => state.domains.transferred,
};

const actions = {
    [LOGIN]: ({ commit, dispatch, getters }, session) => {
        if (!session) {
            return commit(FAILED_LOGIN);
        }

        var instance = getters.namebase;
        if (!instance) {
            instance = new NameBase({ Session: session });
        }

        instance.user((error, status, result) => {
            if (status !== 200 || error) {
                return commit(SERVER_ERROR);
            }

            if (status === 200 && result.hns_balance !== undefined) {
                commit(SET_BALANCE, 'hns', result.hns_balance);
                commit(SET_BALANCE, 'usd', result.usd_balance);

                commit(LOGGED_IN, instance);

                dispatch(GET_DOMAINS);
                dispatch(GET_DASHBOARD);
            }
        });
    },
    [UPDATE_INFO]: ({ commit, dispatch, getters }) => {
        var instance = getters.namebase;

        if (!instance) {
            return commit(NOT_LOGGED_IN);
        }

        dispatch(GET_DOMAINS);
        dispatch(GET_DASHBOARD);
        dispatch(UPDATE_BALANCE);
    },
    [GET_DASHBOARD]: ({ commit, getters }) => {
        var instance = getters.namebase;

        if (!instance) {
            return commit(NOT_LOGGED_IN);
        }

        instance.user().dashboard((error, status, result) => {
            if (status === 500 || error) {
                return commit(SERVER_ERROR);
            }

            if (result.success) {
                commit(SET_HEIGHT, result.height);
                commit(SET_LOCKEDHNS, result.lockedHns);
            }
        });
    },
    [GET_DOMAINS]: ({ commit, getters }) => {
        var instance = getters.namebase;
        if (!instance) {
            return commit(NOT_LOGGED_IN);
        }

        var types = {
            listed: 'listedDomains',
            notlisted: 'domains',
            transferred: 'transferredDomains',
        };

        var handle = (error, status, result) => {
            if (error || status !== 200) {
                return commit(SERVER_ERROR);
            }

            commit(SET_HEIGHT, result.currentHeight);
            commit(SET_DOMAINS, key, result.domains);
        };

        for (var key in types) {
            if (key === 'listed') {
                instance.user()[types[key]](handle);
            } else {
                instance
                    .user()
                    [types[key]](0, 'acquiredAt', 'asc', 100, handle);
            }
        }
    },
    [UPDATE_BALANCE]: ({ commit, getters }) => {
        var instance = getters.namebase;
        if (!instance) {
            return commit(NOT_LOGGED_IN);
        }

        instance.user((error, status, result) => {
            if (status === 500 || error) {
                return commit(SERVER_ERROR);
            }

            if (status === 200 && result.hns_balance !== undefined) {
                commit(SET_BALANCE, 'hns', result.hns_balance);
                commit(SET_BALANCE, 'usd', result.usd_balance);
            }
        });
    },
};

const mutations = {
    [SERVER_ERROR]: (state) => {
        state.accState = 'server-error';
    },
    [LOGGED_IN]: (state, session) => {
        state.accState = 'logged-in';
        state.session = session;
    },
    [SESSION_EXPIRED]: (state) => {
        state.accState = 'session-expired';
        state.session = false;
    },
    [FAILED_LOGIN]: (state) => {
        state.accState = 'login-failed';
    },
    [NOT_LOGGED_IN]: (state) => {
        state.accState = 'not-logged-in';
    },
    [SET_HEIGHT]: (state, height) => {
        state.accState = 'setting-height';

        if (height > state.height) {
            state.height = height;
            state.date = new Date().getTime();
        }
    },
    [SET_LOCKEDHNS]: (state, lockedhns) => {
        state.accState = 'setting-lockedhns';
        state.lockedHns = lockedhns;
        state.date = new Date().getTime();
    },
    [SET_BALANCE]: (state, type, balance) => {
        state.accState = `setting-${type}-balance`;
        state[`${type}balance`] = balance;
        state.date = new Date().getTime();
    },
    [SET_DOMAINS]: (state, type, list) => {
        // types: listed, notlisted, transferred
        state.accState = `setting-${type}-domains`;
        for (var domain in list) {
            if (
                !state.domains[type].find((e) => e.name === list[domain].name)
            ) {
                Vue.set(
                    state.domains[type],
                    state.domains[type].length,
                    list[domain],
                );
            }
        }
        state.date = new Date().getTime();
    },
};

export default {
    state,
    getters,
    actions,
    mutations,
};
