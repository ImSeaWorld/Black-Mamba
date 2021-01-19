<template>
    <div class="q-pa-md">
        <div class="row justify-center">
            <div class="col-4" style="min-width: 325px;">
                <q-card inline style="text-align: center;" class="q-ma-sm">
                    <q-card-section class="q-pa-sm">
                        <div class="text-h6">NameBase API</div>
                        <div class="text-subtitle2">NameBase.io</div>
                        <q-btn
                            fab
                            color="grey-10"
                            icon="mdi-reload"
                            class="absolute text-green-5"
                            style="top: 5px;right: 12px;"
                            @click="$store.dispatch('UPDATE_INFO')"
                        >
                            <q-tooltip content-class="text-green-4" content-style="background-color: #333A34">
                                Refresh collections
                            </q-tooltip>
                        </q-btn>
                    </q-card-section>
                    <q-separator />
                    <q-card-section>
                        <q-list>
                            <q-item>
                                <q-item-section>
                                    <q-item-label>Login State</q-item-label>
                                    <q-item-label 
                                        :class="{ 
                                            'text-green': nb.instance, 
                                            'text-red': !nb.instance
                                        }" 
                                        caption
                                    >
                                        {{(nb.instance) ? 'Logged in' : 'Not logged in'}}
                                    </q-item-label>
                                </q-item-section>
                            </q-item>
                            <q-item>
                                <q-item-section>
                                    <q-item-label>Domain List</q-item-label>
                                    <q-item-label 
                                        :class="{ 'text-green': nb.domainsLoaded, 'text-red': !nb.domainsLoaded }" 
                                        caption
                                    >
                                        {{ nb.domainsLoaded ? 'Loaded' : 'Not loaded' }}
                                    </q-item-label>
                                </q-item-section>
                            </q-item>
                            <q-item>
                                <q-item-section>
                                    <q-item-label>Last Function</q-item-label>
                                    <q-item-label caption>{{ nb.status }}</q-item-label>
                                </q-item-section>
                            </q-item>
                            <q-item>
                                <q-item-section>
                                    <q-item-label>Last Fetch</q-item-label>
                                    <q-item-label caption v-if="nb.lasttimestamp" class="text-green">{{ new Date(nb.lasttimestamp) | moment('from', 'now') }}</q-item-label>
                                    <q-item-label caption v-else>Never</q-item-label>
                                </q-item-section>
                            </q-item>
                        </q-list>
                    </q-card-section>
                </q-card>
            </div>
            <div class="col-4" style="min-width: 250px;">
                <q-card inline style="text-align: center;" class="q-ma-sm">
                    <q-card-section class="q-pa-sm">
                        <div class="text-h6">Price Tracker</div>
                        <div class="text-subtitle2">CoinCap.io</div>
                    </q-card-section>
                    <q-separator />
                    <q-card-section>
                        <q-list>
                            <q-item>
                                <q-item-section>
                                    <q-item-label>
                                        Connection State
                                        <q-btn size="xs" icon="mdi-close-network" class="text-red" style="margin-left: 5px;" round @click="$store.dispatch('DISCONNECT')"
                                            :disabled="!price.connection"
                                        >
                                            <q-tooltip content-class="text-grey-2 bg-grey-10" :content-style="!price.connection ? 'display: none;' : ''">
                                                Disconnect from websocket server
                                            </q-tooltip>
                                        </q-btn>
                                    </q-item-label>
                                    <q-item-label :class="{ 'text-green': price != 'CLOSED', 'text-red': price == 'CLOSED' }" caption>
                                        <template v-if="price.connection && (price.connection.readyState != 3)">
                                            {{ ['Connecting', 'Open', 'Closing', 'Closed'][price.connection.readyState] }}
                                        </template>
                                        <template v-else>
                                            <q-btn size="sm" label="Reconnect" icon="mdi-reload" @click="$store.dispatch('CONNECT')" />
                                        </template>
                                    </q-item-label>
                                </q-item-section>
                            </q-item>
                            <q-item>
                                <q-item-section>
                                    <q-item-label>Last Function</q-item-label>
                                    <q-item-label caption>{{ price.status.toUpperCase() }}</q-item-label>
                                </q-item-section>
                            </q-item>
                            <q-item>
                                <q-item-section>
                                    <q-item-label>Last Fetch</q-item-label>
                                    <q-item-label caption v-if="price.lasttimestamp" class="text-green">{{ new Date(price.lasttimestamp) | moment('from', 'now') }}</q-item-label>
                                    <q-item-label caption v-else>Never</q-item-label>
                                </q-item-section>
                            </q-item>
                        </q-list>
                    </q-card-section>
                </q-card>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
    name: 'Log',
    components: {},
    data() {
        return {
            nb: {
                status: 'N/A',
                instance: false,
                domainsLoaded: false,
                lasttimestamp: false,
                loaded: false,
            },
            price: {
                status: 'n/a',
                connection: false,
                lasttimestamp: false,
                loaded: false,
            },
        };
    },
    computed: {
        ...mapGetters([
            'priceStatus',
            'namebaseStatus',
            'namebase',
            'getConnection',
            'domainsLoaded',
            'lasttimestamp',
            'getPrices',
        ]),
    },
    mounted() {
        this.nb.status = this.namebaseStatus;
        this.nb.instance = this.namebase;
        this.nb.domainsLoaded = this.domainsLoaded;
        this.nb.lasttimestamp = this.lasttimestamp;
        this.price.status = this.getPrices.status;
        this.price.connection = this.getPrices.wsConnection;
        this.price.lasttimestamp = this.getPrices.lasttimestamp;
    },
    watch: {
        getPrices: {
            handler(to) {
                this.price.status = to.status;
                this.price.connection =
                    to.wsConnection.readyState < 2 ? to.wsConnection : false;
                this.price.lasttimestamp = to.lasttimestamp;
            },
            deep: true,
        },
        namebase(to) {
            this.nb.instance = to;
        },
        domainsLoaded(to) {
            this.nb.domainsLoaded = to;
        },
        lasttimestamp(to) {
            this.nb.lasttimestamp = to;
        },
        namebaseStatus(to) {
            this.nb.status = to;
        },
    },
};
</script>
