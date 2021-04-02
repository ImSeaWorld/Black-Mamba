import Vue from 'vue';
import NameBase from 'namebasejs';
import {
    LOGIN,
    GET_BIDS,
    POWER_LIST,
    GET_DOMAINS,
    UPDATE_INFO,
    LIST_DOMAIN,
    LOCAL_LOGIN,
    POWER_SEARCH,
    GET_DASHBOARD,
    DOMAIN_SEARCH,
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
    SET_SEARCH_STATE,
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
            totalDomains: 0,
        },
        lister: {
            loop: null,
            current: '',
            index: 0,
            errors: [],
        },
        search: {
            list: '',
            progress: 0,
            loading: false,
            open: [],
            claimed: [],
            reserved: [],
            released: [],
            unreleased: [],
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

    namebaseSearch: (state) => state.namebase.search,

    powerListerInstance: (state) => state.namebase.lister,

    spreadDomains: (state) => [
        ...state.namebase.domains.listed,
        ...state.namebase.domains.notlisted,
        // We're not going to include transferred
    ],
    allDomains: (state) => state.namebase.domains,
    domainsLength: (state) => {
        return state.namebase.domains.totalDomains;
        /*return (
            state.namebase.domains.listed.length +
            state.namebase.domains.notlisted.length +
            state.namebase.domains.transferred.length
        );*/
    },
    domainsLoaded: (state) => state.namebase.domains.loaded,
    listedDomains: (state) => state.namebase.domains.listed,
    notlistedDomains: (state) => state.namebase.domains.notlisted,
    transferredDomains: (state) => state.namebase.domains.transferred,
};

const actions = {
    [LOCAL_LOGIN]: ({ dispatch, getters }, { Email, Password, Token }) => {
        return new Promise((resolve, reject) => {
            if (Email == '' && Password == '')
                reject('Empty fields email and password. Come on guy...');

            var instance = getters.namebase;
            if (!instance) {
                instance = new NameBase();
            }

            instance.Auth.Login({ Email, Password, Token })
                .then(({ data, status, session }) => {
                    console.log(data, session);

                    if (status != 200)
                        reject(
                            `Sever replied with ${status} which is unexpected`,
                        );

                    if (data.success) {
                        dispatch(LOGIN, session.split('=')[1]).then(resolve);
                    } else reject(data);
                })
                .catch(reject);
        });
    },
    [LOGIN]: ({ commit, dispatch, getters }, session) => {
        return new Promise((resolve, reject) => {
            if (!session) reject('Session not set!');

            var instance = getters.namebase;
            if (!instance) {
                instance = new NameBase({ Session: session });
            }

            instance.User.Self().then(({ data, status }) => {
                if (status != 200)
                    reject(`Sever replied with ${status} which is unexpected`);

                if (data.hns_balance !== undefined) {
                    commit(SET_BALANCE, {
                        type: 'hns',
                        balance: data.hns_balance,
                    });

                    commit(SET_BALANCE, {
                        type: 'usd',
                        balance: data.usd_balance,
                    });

                    commit(LOGGED_IN, { namebase: instance, session: session });

                    dispatch(GET_BIDS);
                    dispatch(GET_DOMAINS);
                    dispatch(GET_DASHBOARD);
                    dispatch(CONNECT);
                    resolve();
                }
            });
        });
    },
    [POWER_LIST]: ({ commit, dispatch, getters }, cancel = false) => {
        var marked = getters.markedDomains;
        var lister = getters.powerListerInstance;

        var cw = (numDomains, totalLength) => {
            return 1 / (numDomains / totalLength);
        };

        var loop = (getters) => {
            // Get new instance every loop
            var _nList = getters.powerListerInstance;
            var _nMarked = getters.markedDomains;
            console.log(`New Loop:`, _nList, _nMarked);
            dispatch(LIST_DOMAIN, _nMarked[_nList.index]).then(() => {
                commit(POWER_LIST, {
                    loop: _loop,
                    index: _nList.index++,
                    domain: _nMarked[_nList.index].domain,
                });
            });
        };

        if (!lister.loop) {
            var _loop = setInterval(
                () => loop(getters),
                cw(Object.keys(marked).length, 2.16e7 * 4),
            );
        } else {
            if (cancel) {
                clearInterval(lister.loop);
            }
        }
    },
    [LIST_DOMAIN]: ({ commit, getters }, { domain, price, description }) => {
        /* prettier-ignore */
        return new Promise((resolve, reject) => {
            var instance = getters.namebase;

            if (!instance) reject('Must be logged in');

            instance.Marketplace.Domain(marked.domain).then(({data, status}) => {
                if (status != 200) reject(`Sever replied with ${status} which is unexpected`);

                if (data.success && data.isOwner) {
                    instance.Marketplace.List(domain, price, description).then(({data, status}) => {
                        if (data.success) {
                            resolve();
                        }

                        reject(`Failed to list domain ${domain} :: status ${status} :: ${JSON.stringify(data)}`);
                    }).catch(reject);
                }
            }).catch(reject);
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
        return new Promise((resolve, reject) => {
            var instance = getters.namebase;

            if (!instance) reject('Not logged in!');

            instance.User.Dashboard()
                .then(({ data, status }) => {
                    if (status >= 500) reject('Server returned an error!');

                    if (data.success) {
                        commit(SET_HEIGHT, data.height);
                        commit(SET_LOCKEDHNS, data.lockedHns);
                        resolve();
                    }
                })
                .catch(reject);
        });
        /*var instance = getters.namebase;

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
        });*/
    },
    [GET_DOMAINS]: ({ commit, getters }) => {
        return new Promise((resolve, reject) => {
            var instance = getters.namebase;

            if (!instance) reject('Not logged in!');

            commit(SET_TABLE_STATE, false);

            var types = {
                listed: 'ListedDomains',
                notlisted: 'Domains',
                transferred: 'TransferredDomains',
            };

            for (var key in types) {
                console.log(`[${key}] = ${types[key]}`);
                if (key === 'listed') {
                    instance.User[types[key]]().then(({ data, status }) => {
                        if (status != 200)
                            reject(
                                `Server sent an unexpected response: ${status}`,
                            );

                        commit(SET_HEIGHT, data.currentHeight);
                        commit(SET_DOMAINS, {
                            type: key,
                            list: data.domains,
                        });
                    });
                } else {
                    var _loop = (i, types, key) => {
                        instance.User[types[key]]({
                            offset: i,
                            sortKey: 'acquiredAt',
                            sortDirection: 'desc',
                            limit: 100,
                        }).then(({ data }) => {
                            if (data.domains) {
                                if (data.domains.length > 0) {
                                    commit(SET_DOMAINS, {
                                        type: key,
                                        list: data.domains,
                                        count: data.totalCount,
                                    });

                                    if (data.domains.length == 100)
                                        _loop(i + 100, types, key);
                                }
                            }

                            commit(SET_HEIGHT, data.currentHeight);
                        });
                    };
                    _loop(0, types, key);
                }
            }
            commit(SET_TABLE_STATE, true);
            resolve();
        });
    },
    [GET_BIDS]: ({ commit, getters }, clear = false) => {
        var instance = getters.namebase;
        if (!instance) {
            return commit(NOT_LOGGED_IN);
        }

        commit(SET_BIDS, { clear: clear });

        var types = ['Open', 'Lost', 'Revealing'];

        for (var ti in types) {
            var func = (i, type) =>
                instance.User.Bids[type](i).then(({ data, status }) => {
                    if (status != 200) commit(SERVER_ERROR);

                    if (
                        !!data.errorCode &&
                        data.errorCode === 'mustBeLoggedIn'
                    ) {
                        console.error(data, status);
                        commit(SESSION_EXPIRED);
                        return;
                    }

                    if (data[`${type.toLowerCase()}Bids`].length > 0) {
                        commit(SET_BIDS, {
                            type: type.toLowerCase(),
                            list: data[`${type.toLowerCase()}Bids`],
                        });

                        func(i + 20, type);
                    }

                    commit(SET_HEIGHT, data.height);
                });
            func(0, types[ti]);
        }
    },
    [UPDATE_BALANCE]: ({ commit, getters }) => {
        return new Promise((resolve, reject) => {
            var instance = getters.namebase;

            if (!instance) reject('Not logged in!');

            instance.User.Self().then(({ data, status }) => {
                if (status >= 500) reject('Unexpected error');

                if (data.hns_balance !== undefined) {
                    commit(SET_BALANCE, {
                        type: 'hns',
                        balance: data.hns_balance,
                    });
                    commit(SET_BALANCE, {
                        type: 'usd',
                        balance: data.usd_balance,
                    });
                }
            });
        });
    },
    [DOMAIN_SEARCH]: ({ commit, getters }, { domain, progress }) => {
        return new Promise((resolve, reject) => {
            var instance = getters.namebase;
            if (!instance) {
                return commit(NOT_LOGGED_IN);
            }

            // sanitize domain further
            // Removes the following: !@#$%^&*()+`~:;'"[]}{\/|?,<>
            // Cannot lead with underscore, but underscores are legal
            // Cannot be 2 numbers, but multiple numbers is legal
            domain = domain
                .replace(/[\s.\n\r{}()=+*&^%$#@!`~:;'"\[\]\\/|?,<>]/g, '')
                .toLowerCase();

            instance
                .Domain(domain)
                .then(({ data, status }) => {
                    var dna = false;
                    if (data.invalidName) {
                        dna = true;
                        reject(`Invalid name: ${domain}`);
                    }

                    if (data.reserved) {
                        dna = true;
                        commit(SET_SEARCH_STATE, { reserved: data });
                    }

                    if (data.closeAmount) {
                        dna = true;
                        commit(SET_SEARCH_STATE, { claimed: data });
                    } else if (data.highestStakeAmount) {
                        dna = true;
                        commit(SET_SEARCH_STATE, { open: data });
                    }

                    if (data.height < data.releaseBlock) {
                        dna = true;
                        commit(SET_SEARCH_STATE, { unreleased: data });
                    }

                    if (!dna) {
                        commit(SET_SEARCH_STATE, { released: data });
                    }

                    if (progress > getters.namebaseSearch.progress) {
                        commit(SET_SEARCH_STATE, { progress: progress });
                        if (progress >= 1) {
                            setTimeout(() => {
                                commit(SET_SEARCH_STATE, { progress: 0 });
                            }, 6500);
                        }
                    }

                    resolve();
                })
                .catch(reject);
        });
    },
    [POWER_SEARCH]: ({ commit, dispatch, getters }, list) => {
        var nlist = list.replace(/^\s*$(?:\r\n?|\n)/gm, '').split('\n');
        commit(SET_SEARCH_STATE, { list: nlist, loading: true });

        let i = 0,
            x = 0;
        var _loop = () => {
            dispatch(DOMAIN_SEARCH, {
                domain: nlist[x++],
                progress: ++i / nlist.length,
            })
                .then(() => {
                    if (x <= nlist.length - 1) _loop();
                    else commit(SET_SEARCH_STATE, { loading: false });

                    console.log(
                        x <= nlist.length - 1
                            ? `Loop ${x}/${nlist.length - 1} - ${i}`
                            : `Loading ${getters.namebaseSearch.loading}`,
                    );
                })
                .catch((e) => {
                    if (x <= nlist.length - 1) _loop();
                    else commit(SET_SEARCH_STATE, { loading: false });
                });
        };
        _loop();
    },
};

const mutations = {
    [POWER_LIST]: (state, { loop, domain, index, error }) => {
        if (error) {
            state.lister.errors.push(error);
            return;
        }

        if (loop) {
            state.lister.loop = loop;
        } else if (loop === null) {
            clearInterval(state.lister.loop);
        }

        if (domain) {
            state.lister.current = domain;
        }

        if (index) {
            state.lister.index = index;
        }
    },
    [SET_TABLE_STATE]: (state, loaded) => {
        state.namebase.domains.loaded = loaded;
    },
    [SET_SEARCH_STATE]: (state, search) => {
        // will update each state that exists
        for (var k in search) {
            if (
                k === 'open' ||
                k === 'claimed' ||
                k === 'reserved' ||
                k === 'released' ||
                k === 'unreleased'
            ) {
                var index = state.namebase.search[k].findIndex(
                    (v) => v.name === search[k].name,
                );

                console.log(search[k], index);

                Vue.set(
                    state.namebase.search[k],
                    index >= 0 ? index : state.namebase.search[k].length,
                    search[k],
                );
            } else {
                state.namebase.search[k] = search[k];
            }
        }
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
    [SET_DOMAINS]: (state, { type, list, count }) => {
        // types: listed, notlisted, transferred
        state.namebase.status = SET_DOMAINS;
        state.namebase.domains.totalDomains = count || 0;

        var addData = (domain, list) => {
            state.namebase.instance
                .Domain(list[domain].name)
                .then(({ data }) => {
                    if (
                        data ==
                        'Too many requests sent from this IP, please try again shortly.'
                    ) {
                        setTimeout(() => {
                            addData(domain, list);
                        }, 500);
                        return;
                    }

                    var index = state.namebase.domains[type].findIndex(
                        (e) => e.name === list[domain].name,
                    );

                    if (data.success) {
                        Vue.set(
                            state.namebase.domains[type],
                            index < 0
                                ? state.namebase.domains[type].length
                                : index,
                            {
                                ...list[domain],
                                data: {
                                    closeAmount: Number(data.closeAmount),
                                    closeBlock: data.closeBlock,
                                    highestStakeAmount: data.highestStakeAmount,
                                    numWatching: data.numWatching,
                                    numberViews: data.numberViews,
                                    openBlock: data.openBlock,
                                    releaseBlock: data.releaseBlock,
                                    revealBlock: data.revealBlock,
                                    watching: data.watching,
                                },
                            },
                        );
                    }
                });
        };

        for (var domain in list) {
            addData(domain, list);
        }
        state.namebase.lasttimestamp = new Date().getTime();
        state.namebase.status = FINISHED;
    },
    [SET_BIDS]: (state, { type, list, clear }) => {
        state.namebase.status = SET_BIDS;

        if (clear) {
            for (var type in state.namebase.bids) {
                state.namebase.bids[type] = [];
            }
            return;
        }

        //console.log(type, list, clear);

        for (var domain in list) {
            try {
                var index = state.namebase.bids[type].findIndex(
                    (e) => e.domain === list[domain].domain,
                );
            } catch (e) {
                console.error(`${type} - ${e}`);
            }

            Vue.set(
                state.namebase.bids[type],
                index >= 0 ? index : state.namebase.bids[type].length,
                list[domain],
            );
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
