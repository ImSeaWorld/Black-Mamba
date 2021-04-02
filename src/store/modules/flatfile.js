import fs from 'fs';
import Vue from 'vue';

const remote = require('electron').remote;
const app = remote.app;

import {
    // Statuses
    NOT_LOADED,
    NO_SAVE_FOUND,
    // Actions
    LOAD_SAVE,
    SAVE_LOGIN,
    MARK_DOMAIN,
    UPDATE_SAVE,
    REMEMBER_LOGIN,
    // Mutations
    SET_SAVE,
    SET_FF_STATUS,
    SET_LASTACTION,
} from '../actions/flatfile';
import { LOGIN, NOT_LOGGED_IN } from '../actions/namebase';

const DIRECTORY = app.getPath('userData') + '\\';
const SAVE = DIRECTORY + 'meta.json';

const state = {
    save: {
        marked: [
            /*{
                domain: 'domain',
                price: 35.0, // HNS
                description: 'domain description',
            },*/
            // example
            /*{
                name: 'Swear Words',
                domains: [
                    {
                        domain: 'domain',
                        price: 35.0, // HNS
                        description: 'domain description',
                    },
                ],
            },*/
        ],
        spa: [
            /*{
                name: 'Template 1',
                categories: {},
                domains: {},
            }*/
        ],
        status: NOT_LOADED,
        lastAction: false,
        coinWatch: ['eth'],
    },
};

const getters = {
    markedDomains: (state) => state.save.marked,
};

const actions = {
    // This runs first, so check for directories here
    [LOAD_SAVE]: ({ commit, dispatch, getters }) => {
        commit(SET_LASTACTION, LOAD_SAVE);
        if (!fs.existsSync(DIRECTORY)) {
            fs.mkdirSync(DIRECTORY);
        }

        if (!fs.existsSync(SAVE)) {
            return commit(SET_FF_STATUS, NO_SAVE_FOUND);
        }

        fs.readFile(SAVE, 'utf8', (err, data) => {
            if (err) throw err;

            try {
                let save = JSON.parse(data);

                dispatch(LOGIN, save['session']);
                commit(SET_SAVE, save);
            } catch {
                commit(NOT_LOGGED_IN);
            }
        });
    },
    [REMEMBER_LOGIN]: ({ commit, dispatch }, session) => {
        commit(SET_LASTACTION, REMEMBER_LOGIN);
        dispatch(LOGIN, session);
        dispatch(SAVE_LOGIN, session);
    },
    [SAVE_LOGIN]: ({ commit }, session) => {
        commit(SET_LASTACTION, SAVE_LOGIN);
        if (fs.existsSync(SAVE)) {
            fs.readFile(SAVE, 'utf8', (err, data) => {
                if (err) throw err;

                let save = {};
                try {
                    save = JSON.parse(data);
                } catch {}
                save['session'] = session;

                fs.writeFileSync(SAVE, JSON.stringify(save));
            });
        } else {
            fs.writeFile(
                SAVE,
                JSON.stringify({ session: session }),
                { flag: 'wx' },
                function(err) {
                    if (err) throw err;
                    console.log("It's saved!");
                },
            );
        }
    },
    [MARK_DOMAIN]: ({ commit }, domainObj) => {
        commit(SET_LASTACTION, MARK_DOMAIN);
        fs.readFile(SAVE, (err, data) => {
            if (err) throw err;

            let save = JSON.parse(data);

            if (save.marked) {
                var fIndex = save.marked.findIndex(
                    (e) => e.domain === domainObj.domain,
                );

                console.log(fIndex);
                if (fIndex == -1) {
                    save.marked.push(domainObj);
                } else {
                    save.marked[fIndex] = domainObj;
                }
            } else {
                save.marked = [domainObj];
            }

            commit(MARK_DOMAIN, domainObj);

            console.log(save);

            //fs.writeFileSync(SAVE, JSON.stringify(save));
            commit(UPDATE_SAVE, save);
        });
    },
};

const mutations = {
    [MARK_DOMAIN]: (state, domainObj) => {
        var fIndex = state.save.marked.findIndex(
            (e) => e.domain === domainObj.domain,
        );

        Vue.set(
            state.save.marked,
            fIndex > -1 ? fIndex : state.save.marked.length,
            domainObj,
        );
    },
    [UPDATE_SAVE]: (state, save = null) => {
        var _save = state.save;
        if (save) {
            _save = save;
        }

        fs.writeFile(SAVE, JSON.stringify(save), function(err) {
            if (err) throw err;
            console.log("It's saved!");
        });
    },
    [SET_SAVE]: (state, save) => {
        Object.assign(state.save, save);
        //state.save = save;
    },
    [SET_FF_STATUS]: (state, status) => {
        state.save.status = status;
    },
    [SET_LASTACTION]: (state, action) => {
        state.save.lastAction = action;
    },
};

export default {
    state,
    getters,
    actions,
    mutations,
};
