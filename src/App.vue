<template>
  <q-layout view="hHh lpR fFf">
      
    <q-overlay v-model="!login.loggedin" cursor-type="default" no-scroll z-index="5000">
        <template v-slot:body>
            <div class="fullscreen row justify-center items-center">
                <q-spinner v-if="login.loading" color="yellow" size="3em"></q-spinner>
                <q-card style="width: 420px;" :dark="false" v-else>
                    <q-card-section class="text-black text-center text-h5">
                        Login to NameBase
                    </q-card-section>
                    <q-tabs
                        :dark="false"
                        align="justify"
                        v-model="login.tab"
                        class="text-grey"
                        active-color="primary"
                        indicator-color="primary"
                    >
                        <q-tab name="session" label="Session" />
                        <q-tab name="local" label="Email/Pass"  />
                    </q-tabs>
                    <q-separator />
                    <q-tab-panels animated v-model="login.tab" :dark="false">
                        <q-tab-panel name="session">
                            <q-form ref="session">
                                <q-input 
                                    filled 
                                    :dark="false"
                                    label="Session"
                                    type="password"
                                    v-model="login.session"
                                    class="q-mb-sm"
                                    hint="Namebase session stored in your browser"
                                    :rules="[ val => val && val.length > 0 || 'Something needs to go here!' ]"
                                />
                                <q-checkbox :dark="false" class="text-grey-7" style="font-size: 1.2rem;user-select: none;" v-model="login.remember" label="Memba Me" />
                                <q-btn color="primary" label="Login" class="full-width q-mt-sm" @click="nbLogin()"></q-btn>
                            </q-form>
                        </q-tab-panel>
                        <q-tab-panel name="local">
                            <q-form ref="login">
                                <q-input 
                                    filled 
                                    :dark="false"
                                    label="Email" 
                                    hint="Your email stupid..." 
                                    :rules="[ val => val && val.length > 0 || 'Something needs to go here!' ]"
                                    v-model="login.email"
                                />

                                <q-input 
                                    filled 
                                    :dark="false" 
                                    class="q-my-sm"
                                    label="Password" 
                                    hint="Your password stoopid..."
                                    type="password"
                                    :rules="[ val => val && val.length > 0 || 'Something needs to go here!' ]"
                                    v-model="login.password"
                                />

                                <q-input 
                                    filled 
                                    :dark="false" 
                                    class="q-my-sm"
                                    label="2FA" 
                                    hint="Your 2fa stewpid..."
                                    v-model="login._2fa"
                                />
                                
                                <q-checkbox :dark="false" class="text-grey-7" style="font-size: 1.2rem;user-select: none;" v-model="login.local_remember" label="Memba Me" />

                                <q-btn color="primary" label="Login" class="full-width q-mt-sm" @click="nbLogin()"></q-btn>

                            </q-form>
                        </q-tab-panel>
                    </q-tab-panels>
                </q-card>
            </div>
        </template>
    </q-overlay>

    <q-header elevated class="bg-dark text-white" height-hint="98" style="z-index: 5001;">
        <q-toolbar style="-webkit-app-region: drag;margin: 2px;" >

            <q-avatar>
                <img src="./assets/logo.png">
            </q-avatar>

            <q-toolbar-title>Black Mamba</q-toolbar-title>

            <!-- Windows Buttons -->
            <q-btn dense flat round icon="mdi-bell" size="md" @click="right = !right" style="-webkit-app-region: no-drag;" :style="!login.loggedin ? 'display: none;' : ''" disable>
                <!--q-badge floating transparent color="negative" style="font-size: 0.7rem;">12</q-badge-->
            </q-btn>
            <q-btn flat dense icon="mdi-reload" @click="app.win.reload()" style="-webkit-app-region: no-drag" />
            <q-btn flat dense icon="mdi-window-minimize" @click="app.win.minimize()" style="-webkit-app-region: no-drag" />
            <q-btn flat dense :icon="`mdi-window-${app.maximized ? 'restore' : 'maximize'}`" @click="() => {if(app.maximized) app.win.unmaximize(); else app.win.maximize();}" style="-webkit-app-region: no-drag" />
            <q-btn flat dense icon="mdi-close" @click="app.win.destroy()" style="-webkit-app-region: no-drag" />
            <!-- END Windows Buttons -->
        </q-toolbar>

        <q-tabs align="left">
            <q-route-tab to="/" label="My Domains" :disable="!login.loggedin">
                <q-badge floating v-if="domainsLength > 0">{{domainsLength}}</q-badge>
            </q-route-tab>
            <q-route-tab to="/marketplace" label="Marketplace" :disable="!login.loggedin" />
            <q-route-tab to="/auctions" label="Auctions" :disable="!login.loggedin">
                <q-badge color="dark" floating>
                    <span class="text-blue-6" style="padding-right: 3px;font-weight: bold;">{{namebaseBids.open.length}}</span>
                    <span class="text-orange" style="padding: 0 3px;font-weight: bold;">{{namebaseBids.revealing.length}}</span>
                    <span class="text-red" style="padding-left: 3px;font-weight: bold;">{{namebaseBids.lost.length}}</span>
                </q-badge>
            </q-route-tab>
            <q-route-tab to="/spa" label="SPA Builder" :disable="!login.loggedin" />
            <q-route-tab to="/log" label="Log" :disable="!login.loggedin" />
        </q-tabs>
    </q-header>

    <q-drawer v-model="right" side="right" bordered>
        <div class="q-pa-md">
            <q-list>

                <template v-for="(noto, i) in notifications">
                    <q-expansion-item :key="i">
                        <template v-slot:header>

                            <q-item-section>
                                
                                <q-item>
                                    <q-item-section style="text-align: center;">
                                        <q-item-label style="user-select:none;">{{ noto.title }}</q-item-label>
                                        <q-item-label style="user-select:none;" caption>{{ noto.domain }}</q-item-label>
                                        <q-item-label style="user-select:none;" caption>{{ noto.date | moment('from', 'now') }}</q-item-label>
                                    </q-item-section>
                                </q-item>
                                
                            </q-item-section>

                        </template>

                        <q-card>
                            <q-card-section>
                                <q-item>
                                    <q-item-section style="text-align: center;">
                                        <q-item-label style="user-select:none;">{{ dd2hns(noto.value) }} HNS</q-item-label>
                                        <q-item-label style="user-select:none;" caption>{{ formatCurrency('GBP', dd2hns(noto.value) * prices.handshake) }}</q-item-label>
                                    </q-item-section>
                                </q-item>
                                <q-btn-group spread>
                                    <q-btn size="10px" label="View" />
                                    <q-btn size="10px" color="red" label="Dismiss" />
                                </q-btn-group>
                            </q-card-section>
                        </q-card>
                    </q-expansion-item>

                    <q-separator />
                </template>

            </q-list>
        </div>
    </q-drawer>

    <q-page-container class="absolute-full">
        <q-scroll-area style="height: 100%; max-width: 100vw;" visible>
            <router-view />
        </q-scroll-area>
    </q-page-container>

    <q-footer elevated class="bg-dark text-white">
        <q-toolbar>
            <q-item-section v-if="account.hnsBalance > -1 && account.lockedHns > -1">
                <table style="width: 75px;white-space: nowrap;">
                    <col style="width: 1px;white-space: nowrap;">
                    <col style="width: 50px;white-space: nowrap;">
                    <col style="width: 50px;white-space: nowrap;">
                    <tbody>
                        <tr>
                            <td style="text-align: right;color: #757575;">Balance: </td>
                            <td style="text-align: right;padding: 0 10px;">{{formatdd2hns(account.hnsBalance)}} HNS </td>
                            <td style="text-align: right;color: #757575;" v-if="prices.handshake">{{formatCurrency('USD', dd2hns(account.hnsBalance) * prices.handshake)}}</td>
                        </tr>
                        <tr>
                            <td style="text-align: right;color: #757575;">Locked: </td>
                            <td style="text-align: right;padding: 0 10px;">{{formatdd2hns(account.lockedHns)}} HNS </td>
                            <td style="text-align: right;color: #757575;" v-if="prices.handshake">{{formatCurrency('USD', dd2hns(account.lockedHns) * prices.handshake)}}</td>
                        </tr>
                    </tbody>
                </table>
            </q-item-section>
            <q-item-section v-else>
                <table style="width: 75px;white-space: nowrap;">
                    <col style="width: 1px;white-space: nowrap;">
                    <col style="width: 50px;white-space: nowrap;">
                    <col style="width: 50px;white-space: nowrap;">
                    <tbody>
                        <tr>
                            <td style="text-align: right;color: #757575;">
                                <q-skeleton animation="blink" type="text" width="56px" />
                            </td>
                            <td style="text-align: right;padding: 0 10px;">
                                <q-skeleton animation="blink" type="text" width="136px" />
                            </td>
                            <td style="text-align: right;color: #757575;">
                                <q-skeleton animation="blink" type="text" width="53px" />
                            </td>
                        </tr>
                        <tr>
                            <td style="text-align: right;color: #757575;">
                                <q-skeleton animation="blink" type="text" width="56px" />
                            </td>
                            <td style="text-align: right;padding: 0 10px;">
                                <q-skeleton animation="blink" type="text" width="136px" />
                            </td>
                            <td style="text-align: right;color: #757575;">
                                <q-skeleton animation="blink" type="text" width="53px" />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </q-item-section>

            <template v-for="(price, i) in prices">
                <q-item-section side>
                    <q-item-label>
                        {{i}}: <span style="color: #21BA45;display: inline-block;">${{ price }}</span>
                    </q-item-label>
                </q-item-section>
            </template>
        </q-toolbar>

    </q-footer>

  </q-layout>
</template>

<script>
import moment from 'moment';
import { remote } from 'electron';
import { mapGetters } from 'vuex';

export default {
    data() {
        return {
            login: {
                loading: true,
                loggedin: false,
                remember: false,
                local_remember: false,
                email: '',
                password: '',
                _2fa: '',
                session: '',
                tab: 'session',
            },
            app: {
                win: remote.getCurrentWindow(),
                maximized: false,
                namebaseLoop: false,
            },
            prices: {},
            ws: {
                connection: null,
            },
            left: false,
            right: false,
            expanded: false,
            account: {
                lockedHns: -1,
                hnsBalance: -1,
                usdBalance: -1,
            },
            notifications: [
                {
                    type: 1,
                    title: 'Offer Received',
                    domain: 'domain/',
                    value: 16384000000,
                    date: moment(new Date()).subtract(1, 'minute'),
                },
                {
                    type: 1,
                    title: 'Offer Received',
                    domain: 'domain2/',
                    value: 351001000000,
                    date: moment(new Date()).subtract(1.5, 'minute'),
                },
                {
                    type: 1,
                    title: 'Offer Received',
                    domain: 'domain3/',
                    value: 20000000,
                    date: moment(new Date()).subtract(1.6, 'minute'),
                },
                {
                    type: 1,
                    title: 'Offer Received',
                    domain: 'domain4/',
                    value: 2000000000,
                    date: moment(new Date()).subtract(2, 'minute'),
                },
            ],
        };
    },
    methods: {
        ...mapGetters([
            'getConnection',
            'getCoinPrices',
            'getCoins',
            'usdBalance',
            'hnsBalance',
            'lockedHns',
            'height',
            'session',
        ]),
        nbLogin() {
            if (this.login.tab === 'local') {
                this.$store
                    .dispatch('LOCAL_LOGIN', {
                        Email: this.login.email,
                        Password: this.login.password,
                        Token: this.login._2fa,
                    })
                    .then((session) => {
                        if (this.login.local_remember)
                            this.$store.dispatch('SAVE_LOGIN', session);
                    });
            } else {
                this.$store.dispatch(
                    this.login.remember ? 'REMEMBER_LOGIN' : 'LOGIN',
                    this.login.session,
                );
            }
        },
        closeApplication() {
            this.app.win.destroy();
        },
        updateMetadata() {
            if (this.login.loggedin) {
                if (remote.BrowserWindow.getAllWindows()[0].isFocused()) {
                    if (this.$route.name != 'Auctions') {
                        this.$store.dispatch('GET_BIDS');
                    }

                    if (this.$route.name != 'Home') {
                        this.$store.dispatch('GET_DOMAINS');
                    }
                }

                this.$store.dispatch('UPDATE_INFO');
            }
        },
    },
    computed: {
        ...mapGetters(['namebaseBids', 'domainsLength', 'namebaseStatus']),
        activeSession() {
            return this.session();
        },
        clockedHns() {
            return this.lockedHns();
        },
        chnsBalance() {
            return this.hnsBalance();
        },
        cusdBalance() {
            return this.usdBalance();
        },
    },
    watch: {
        activeSession(to) {
            this.login.session = to;
            this.login.loggedin = !!to;
        },
        clockedHns(to) {
            this.account.lockedHns = to;
        },
        chnsBalance(to) {
            this.account.hnsBalance = to;
        },
        cusdBalance(to) {
            this.account.usdBalance = to;
        },
        namebaseStatus(to) {
            if (this.login.loading) {
                switch (to) {
                    case 'LOGGED_IN':
                    case 'FAILED_LOGIN':
                    case 'NOT_LOGGED_IN': {
                        this.login.loading = false;
                    }
                }
            }
        },
    },
    beforeDestroy() {
        clearInterval(this.app.namebaseLoop);
    },
    created() {
        this.$store.dispatch('LOAD_SAVE');
    },
    beforeMount() {
        this.login.loggedin = !!this.session();
        this.prices = this.getCoinPrices();
        this.app.namebaseLoop = setInterval(this.updateMetadata, 30000);

        this.app.win.on('maximize', () => {
            this.app.maximized = true;
        });

        this.app.win.on('unmaximize', () => {
            this.app.maximized = false;
        });
    },
    mounted() {
        this.account.lockedHns = this.clockedHns;
        this.account.hnsBalance = this.chnsBalance;
        this.account.usdBalance = this.cusdBalance;
        if (this.login.loading) {
            switch (this.namebaseStatus) {
                case 'LOGGED_IN':
                case 'FAILED_LOGIN':
                case 'NOT_LOGGED_IN': {
                    this.login.loading = false;
                }
            }
        }
    },
    beforeDestroy() {
        this.$store.dispatch('DISCONNECT');
        window.removeEventListener('maximize', () => {});
        window.removeEventListener('unmaximize', () => {});
    },
};
</script>

<style lang="scss">
body {
    overflow: hidden;
}
</style>