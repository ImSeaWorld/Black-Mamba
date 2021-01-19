import Vue from 'vue';
import NameBase from 'namebasejs';
import {
    LOGIN,
    GET_BIDS,
    GET_DOMAINS,
    UPDATE_INFO,
    GET_DASHBOARD,
    UPDATE_BALANCE,
    FINISHED,
    SET_BIDS,
    LOGGED_IN,
    SET_HEIGHT,
    SET_BALANCE,
    SET_DOMAINS,
    FAILED_LOGIN,
    SERVER_ERROR,
    NOT_LOGGED_IN,
    SET_LOCKEDHNS,
    SET_TABLE_STATE,
    SESSION_EXPIRED,
} from '../actions/namebase';
import { CONNECT } from '../actions/prices';

const state = {
    namebase: {
        status: NOT_LOGGED_IN,
        height: -1,
        instance: false,
        balance: {
            hns: -1,
            usd: -1,
        },
        lockedbalance: {
            hns: -1,
        },
        bids: {
            open: [],
            lost: [], // lostBids: [ { domain: "", data: [Object] } ]
            revealing: [],
        },
        domains: {
            loaded: false,
            listed: [],
            notlisted: [],
            transferred: [],
        },
        session: false,
        lasttimestamp: false,
    },
};

const getters = {
    namebaseState: (state) => state.namebase,

    height: (state) => state.namebase.height,
    session: (state) => state.namebase.session,
    namebase: (state) => state.namebase.instance,
    namebaseBids: (state) => state.namebase.bids,
    lasttimestamp: (state) => state.namebase.lasttimestamp,
    namebaseStatus: (state) => state.namebase.status,

    lockedHns: (state) => state.namebase.lockedbalance.hns,

    usdBalance: (state) => state.namebase.balance.usd,
    hnsBalance: (state) => state.namebase.balance.hns,

    allDomains: (state) => state.namebase.domains,
    domainsLength: (state) => {
        return (
            state.namebase.domains.listed.length +
            state.namebase.domains.notlisted.length +
            state.namebase.domains.transferred.length
        );
    },
    domainsLoaded: (state) => state.namebase.domains.loaded,
    listedDomains: (state) => state.namebase.domains.listed,
    notlistedDomains: (state) => state.namebase.domains.notlisted,
    transferredDomains: (state) => state.namebase.domains.transferred,
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
                commit(SET_BALANCE, {
                    type: 'hns',
                    balance: result.hns_balance,
                });
                commit(SET_BALANCE, {
                    type: 'usd',
                    balance: result.usd_balance,
                });

                commit(LOGGED_IN, { namebase: instance, session: session });

                dispatch(GET_BIDS);
                dispatch(GET_DOMAINS);
                dispatch(GET_DASHBOARD);
                dispatch(CONNECT);
            }
        });
    },
    [UPDATE_INFO]: ({ commit, dispatch, getters }) => {
        var instance = getters.namebase;

        if (!instance) {
            return commit(NOT_LOGGED_IN);
        }

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

        commit(SET_TABLE_STATE, false);

        var types = {
            listed: 'listedDomains',
            notlisted: 'domains',
            transferred: 'transferredDomains',
        };

        for (var key in types) {
            var handle = (key) => (error, status, result) => {
                if (error || status !== 200) {
                    return commit(SERVER_ERROR);
                }

                commit(SET_HEIGHT, result.currentHeight);
                commit(SET_DOMAINS, { type: key, list: result.domains });
            };

            if (key === 'listed') {
                instance.user()[types[key]](handle(key));
            } else {
                var _loop = (i, types, key) => {
                    instance
                        .user()
                        [types[key]](
                            i,
                            'acquiredAt',
                            'asc',
                            100,
                            (error, status, result) => {
                                if (error || status !== 200) {
                                    return commit(SERVER_ERROR);
                                }

                                if (result.domains) {
                                    if (result.domains.length > 0) {
                                        commit(SET_DOMAINS, {
                                            type: key,
                                            list: result.domains,
                                        });
                                        setTimeout(() => {
                                            _loop(i + 100, types, key);
                                        }, 500);
                                    }
                                }

                                commit(SET_HEIGHT, result.currentHeight);
                            },
                        );
                };
                _loop(0, types, key);
            }
        }

        commit(SET_TABLE_STATE, true);
    },
    [GET_BIDS]: ({ commit, getters }) => {
        var instance = getters.namebase;
        if (!instance) {
            return commit(NOT_LOGGED_IN);
        }

        var types = ['open', 'lost', 'revealing'];

        for (var ti in types) {
            var func = (i, type) =>
                instance
                    .user()
                    .bids()
                    [type](i, (error, status, result) => {
                        if (error || status !== 200) {
                            console.error(error, status);
                            return commit(SERVER_ERROR);
                        }

                        if (!!result.errorCode) {
                            if (result.errorCode === 'mustBeLoggedIn') {
                                console.error(result, status);
                                return commit(SESSION_EXPIRED);
                            }
                        }

                        if (result[`${type}Bids`].length > 0) {
                            commit(SET_BIDS, {
                                type: type,
                                list: result[`${type}Bids`],
                            });
                            setTimeout(() => {
                                func(i + 20, type);
                            }, 500);
                        }

                        commit(SET_HEIGHT, result.height);
                    });
            func(0, types[ti]);
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
                commit(SET_BALANCE, {
                    type: 'hns',
                    balance: result.hns_balance,
                });
                commit(SET_BALANCE, {
                    type: 'usd',
                    balance: result.usd_balance,
                });
            }
        });
    },
};

const mutations = {
    [SET_TABLE_STATE]: (state, loaded) => {
        state.namebase.domains.loaded = loaded;
    },
    [SERVER_ERROR]: (state) => {
        state.namebase.status = SERVER_ERROR;
    },
    [LOGGED_IN]: (state, { namebase, session }) => {
        state.namebase.status = LOGGED_IN;
        state.namebase.instance = namebase;
        state.namebase.session = session;
    },
    [SESSION_EXPIRED]: (state) => {
        state.namebase.status = SESSION_EXPIRED;
        state.namebase.session = false;
    },
    [FAILED_LOGIN]: (state) => {
        state.namebase.status = FAILED_LOGIN;
    },
    [NOT_LOGGED_IN]: (state) => {
        state.namebase.status = NOT_LOGGED_IN;
    },
    [SET_HEIGHT]: (state, height) => {
        state.namebase.status = SET_HEIGHT;

        if (height > state.namebase.height) {
            state.namebase.height = height;
            state.namebase.lasttimestamp = new Date().getTime();
        }
    },
    [SET_LOCKEDHNS]: (state, lockedhns) => {
        state.namebase.status = SET_LOCKEDHNS;
        state.namebase.lockedbalance.hns = lockedhns;
        state.namebase.lasttimestamp = new Date().getTime();
    },
    [SET_BALANCE]: (state, { type, balance }) => {
        state.namebase.status = SET_BALANCE;
        state.namebase.balance[type] = balance;
        state.namebase.lasttimestamp = new Date().getTime();
    },
    [SET_DOMAINS]: (state, { type, list }) => {
        // types: listed, notlisted, transferred
        state.namebase.status = SET_DOMAINS;
        for (var domain in list) {
            if (
                !state.namebase.domains[type].find(
                    (e) => e.name === list[domain].name,
                )
            ) {
                Vue.set(
                    state.namebase.domains[type],
                    state.namebase.domains[type].length,
                    list[domain],
                );
            }
        }
        state.namebase.lasttimestamp = new Date().getTime();
        state.namebase.status = FINISHED;
    },
    [SET_BIDS]: (state, { type, list }) => {
        state.namebase.status = SET_BIDS;
        for (var domain in list) {
            if (
                !state.namebase.bids[type].find(
                    (e) => e.domain === list[domain].domain,
                )
            ) {
                Vue.set(
                    state.namebase.bids[type],
                    state.namebase.bids[type].length,
                    list[domain],
                );
            }
        }
        state.namebase.lasttimestamp = new Date().getTime();
        state.namebase.status = FINISHED;
    },
    [FINISHED]: (state) => {
        state.namebase.status = FINISHED;
    },
};

export default {
    state,
    getters,
    actions,
    mutations,
};

/*
const state = {};

const getters = {};

const actions = {};

const mutations = {};

export default {
    state,
    getters,
    actions,
    mutations,
};
*/
