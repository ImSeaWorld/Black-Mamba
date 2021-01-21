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
    REMEMBER_LOGIN,
    // Mutations
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
        status: NOT_LOADED,
        lastAction: false,
        coinWatch: ['eth'],
    },
};

const getters = {};

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

        fs.readFile(SAVE, (err, data) => {
            if (err) throw err;

            try {
                let save = JSON.parse(data);

                dispatch(LOGIN, save['session']);
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
            fs.readFile(SAVE, (err, data) => {
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
    [MARK_DOMAIN]: ({ commit }, domain, price, description) => {
        commit(SET_LASTACTION, MARK_DOMAIN);
        fs.readFile(SAVE, (err, data) => {
            if (err) throw err;

            let save = JSON.parse(data);
            let MarkedDomains = save.marked;

            if (!MarkedDomains.find((e) => e.domain === domain)) {
                MarkedDomains.push({
                    domain: domain,
                    price: price,
                    description: description,
                });
                commit(MARK_DOMAIN, {
                    domain: domain,
                    price: price,
                    description: description,
                });
            }

            save.marked = MarkedDomains;

            fs.writeFileSync(SAVE, JSON.stringify(save));
        });
    },
};

const mutations = {
    [MARK_DOMAIN]: (state, { domain, price, description }) => {
        Vue.set(state.save.marked, state.save.marked.length, {
            domain: domain,
            price: price,
            description: description,
        });
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
