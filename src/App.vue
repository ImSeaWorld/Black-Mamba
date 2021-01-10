<template>
  <q-layout view="hHh lpR fFf">

    <q-header elevated class="bg-dark text-white" height-hint="98">
        <q-toolbar style="-webkit-app-region: drag;margin: 2px;">
            <!--q-btn dense flat round icon="mdi-menu" @click="left = !left" /-->
            <q-avatar>
                <img src="./assets/logo.png">
            </q-avatar>

            <q-toolbar-title>Black Mamba</q-toolbar-title>

            <q-btn dense flat round icon="mdi-bell" @click="right = !right" style="-webkit-app-region: no-drag" />
            <q-btn flat dense icon="mdi-window-minimize" style="-webkit-app-region: no-drag" />
            <q-btn flat dense :icon="`mdi-window-${app.maximized ? 'restore' : 'maximize'}`" style="-webkit-app-region: no-drag" />
            <q-btn flat dense icon="mdi-close" style="-webkit-app-region: no-drag" />
        </q-toolbar>

        <q-tabs align="left">
            <q-route-tab to="/" label="My Domains" />
            <q-route-tab to="/about" label="Auctions" />
            <q-route-tab to="/page4" label="The Boyses" />
            <q-route-tab to="/page5" label="The Coin Aye" />
            <q-route-tab to="/page3" label="Log" />
        </q-tabs>
    </q-header>

    <!--q-drawer show-if-above v-model="left" side="left" bordered>
    </q-drawer-->

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

    <q-page-container>
        <router-view />
    </q-page-container>

    <q-footer elevated class="bg-dark text-white">
        <q-toolbar>
            <q-item-section>
                Balance: 0.43 HNS | Locked 1,395.32 HNS
            </q-item-section>

            <template v-for="(price, i) in prices">
                <q-item-section side>
                    <q-item-label style="user-select:none;">
                        {{i}}: <span style="color: #21BA45;display: inline-block;">${{ price }}</span>
                    </q-item-label>
                </q-item-section>

                <!--q-item-section side>
                    <q-item-label style="user-select:none;">
                        HNS: <span style="color: #21BA45;display: inline-block;">${{ prices.handshake }}</span>
                    </q-item-label>
                </q-item-section>

                <q-item-section side>
                    <q-item-label style="user-select:none;">
                        ETH: <span style="color: #21BA45;display: inline-block;">${{ prices.ethereum }}</span>
                    </q-item-label>
                </q-item-section>

                <q-item-section side>
                    <q-item-label style="user-select:none;">
                        XLM: <span style="color: #21BA45;display: inline-block;">${{ prices.stellar }}</span>
                    </q-item-label>
                </q-item-section-->
            </template>
        </q-toolbar>

    </q-footer>

  </q-layout>
</template>

<script>
import moment from 'moment';
import { remote } from 'electron';
import { mapMutations, mapGetters } from 'vuex';

export default {
    data() {
        return {
            app: {
                win: remote.getCurrentWindow(),
                maximized: false,
            },
            prices: {},
            ws: {
                connection: null,
            },
            left: false,
            right: false,
            expanded: false,
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
        ...mapGetters(['getConnection', 'getPrices', 'getCoins']),
    },
    created() {
        this.$store.dispatch('CONNECT');
        /*this.ws.connection = new WebSocket(
            'wss://ws.coincap.io/prices?assets=handshake,bitcoin,ethereum,stellar',
        );
        this.ws.connection.onopen = (event) => {
            //console.log(event);
        };

        this.ws.connection.onmessage = (event) => {
            //console.log(event);
            var data = JSON.parse(event.data);

            for (var coin in data) {
                this.$store.dispatch('UPDATE_PRICE', {
                    coin: coin,
                    price: data[coin],
                });
                //this.prices[coin] = data[coin];
            }
        };*/
    },
    beforeMount() {
        this.prices = this.getPrices();
        this.app.win.on('maximize', () => {
            this.app.maximized = true;
        });

        this.app.win.on('unmaximize', () => {
            this.app.maximized = false;
        });
    },
    beforeDestroy() {
        window.removeEventListener('maximize', () => {});
        window.removeEventListener('unmaximize', () => {});
    },
};
</script>