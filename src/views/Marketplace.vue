<template>
    <div class="q-ma-md q-pa-md bg-dark" style="min-height: calc(100vh - 186px);">
        <q-tabs
            inline-label
            v-model="tab"
            class="text-grey-5"
        >
            <q-tab name="search" label="Search" />
            <q-tab name="bid" label="Power Bid" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>

            <q-tab-panel name="Search">
            </q-tab-panel>

            <q-tab-panel name="bid">
                <q-overlay v-model="bidoverlay.open" cursor-type="default" no-scroll z-index="5000">
                    <template v-slot:body>
                        <div class="fullscreen row justify-center items-center">
                            <q-spinner v-if="bidoverlay.open && bidoverlay.waiting" color="yellow" size="3em"></q-spinner>

                            <q-card style="min-width: 450px;">
                                <q-card-section>

                                    <div class="text-h5 q-my-sm text-center">Power Bid</div>

                                    <q-separator />

                                    <q-input 
                                        v-model="bidoverlay.bid"
                                        label="Bid" 
                                        hint="Bid amount in HNS" 
                                        type="number" 
                                        color="green-5" 
                                        class="q-my-sm"
                                        square 
                                    />

                                    <q-input 
                                        v-model="bidoverlay.blind"
                                        label="Blind" 
                                        hint="Bid mask amount in HNS" 
                                        type="number" 
                                        color="orange-5"
                                        class="q-my-sm"
                                        square 
                                    />

                                    <div 
                                        class="text-center q-my-md"
                                        v-if="bidoverlay.bid > 0 || bidoverlay.blind > 0"
                                    >

                                        <q-separator />

                                        <table style="width: 100%;">
                                            <tbody>
                                                <tr>
                                                    <td>Bid</td>
                                                    <td :class="{ 'text-grey-8': bidoverlay.bid == 0, 'text-positive': bidoverlay.bid > 0 }">
                                                        {{bidoverlay.bid > 0 ? '+' : ''}}{{numberWithCommas(bidoverlay.bid * result.released.length)}} HNS
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>Blind</td>
                                                    <td :class="{ 'text-grey-8': bidoverlay.blind == 0, 'text-positive': bidoverlay.blind > 0 }">
                                                        {{bidoverlay.blind > 0 ? '+' : ''}}{{numberWithCommas(bidoverlay.blind * result.released.length)}} HNS
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>Miner Fee</td>
                                                    <td class="text-positive">+{{numberWithCommas(0.09 * result.released.length)}} HNS</td>
                                                </tr>
                                                <tr>
                                                    <td>Total Domains</td>
                                                    <td class="text-positive">{{numberWithCommas(result.released.length)}}</td>
                                                </tr>
                                                <tr>
                                                    <td>Total Lockup</td>
                                                    <td>{{ numberWithCommas(((Number(bidoverlay.bid) + Number(bidoverlay.blind)) * result.released.length) + (0.09 * result.released.length)) }} HNS</td>
                                                </tr>
                                                <tr>
                                                    <td>Total Dollar</td>
                                                    <td>{{ formatCurrency('USD', (((Number(bidoverlay.bid) + Number(bidoverlay.blind)) * result.released.length) + (0.09 * result.released.length)) * coinprices.handshake) }}</td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        <q-separator />
                                    </div>
                                    <div>
                                        <q-checkbox v-model="bidoverlay.foshizzle" label="Right in the head lad?" :disable="bidoverlay.bid == 0 && bidoverlay.blind == 0" />
                                    </div>
                                    <q-btn class="full-width" color="green" :disable="!bidoverlay.foshizzle" @click="bidOnReleased">Bid on {{numberWithCommas(result.released.length)}} domains</q-btn>
                                    <q-btn class="full-width q-mt-sm" v-if="bidoverlay.open && !bidoverlay.waiting" color="red" label="Close" @click="closeOverlay"></q-btn>
                                </q-card-section>
                            </q-card>
                        </div>
                    </template>
                </q-overlay>
                
                <div class="row justify-center">
                    <div class="row justify-center" style="width: 100%;">
                        <q-input
                            v-model="form.powerSearch"
                            filled
                            autogrow
                            label="Domains"
                            hint="Seperated by newline (enter key) | Quickly search with ctrl + enter"
                            style="width: 100%;"
                            input-style="max-height: 127px;"
                            color="blue-6"
                            square
                            filled
                            :loading="form.loading"
                            @keyup.ctrl.enter="!form.loading ? getDomains() : undefined"
                        />
                    </div>
                    <div class="row q-my-sm justify-left">
                        <q-btn label="Search" color="primary" @click="getDomains()" :disable="form.loading" />
                    </div>
                </div>

                <div class="row justify-center" style="width: 100%;">
                    <q-linear-progress :value="form.progress" class="q-mt-md" v-if="form.progress != 0 || form.progrss < 1" />

                    <q-table
                        dark
                        :data="conformData(result[table.tab])"
                        :columns="table.columns[table.tab]"
                        max-height="100%"
                        style="width: 100%;"
                    >

                        <template v-slot:top-left>
                            <q-tabs
                                inline-label
                                v-model="table.tab"
                                class="text-grey-5"
                            >
                                <q-tab name="released" icon="mdi-door-open" label="Available">
                                    <q-badge color="green" floating transparent v-if="result.released && result.released.length > 0">{{ result.released.length }}</q-badge>
                                </q-tab>
                                <q-tab name="unreleased" icon="mdi-door" label="Unreleased">
                                    <q-badge color="indigo" floating transparent v-if="result.unreleased && result.unreleased.length > 0">{{ result.unreleased.length }}</q-badge>
                                </q-tab>
                                <q-tab name="open" icon="mdi-eye" label="Open">
                                    <q-badge color="orange" floating transparent v-if="result.open && result.open.length > 0">{{ result.open.length }}</q-badge>
                                </q-tab>
                                <q-tab name="reserved" icon="mdi-lock" label="Reserved">
                                    <q-badge color="purple" floating transparent v-if="result.reserved && result.reserved.length > 0">{{ result.reserved.length }}</q-badge>
                                </q-tab>
                                <q-tab name="claimed" icon="mdi-gavel" label="Claimed">
                                    <q-badge color="red" floating transparent v-if="result.claimed && result.claimed.length > 0">{{ result.claimed.length }}</q-badge>
                                </q-tab>
                            </q-tabs>
                        </template>

                        <template v-slot:top-right>
                            <q-btn color="green" v-if="result.released.length > 0 && table.tab === 'released'" @click="bidoverlay.open = true">Open Bids On Available</q-btn>
                        </template>

                        <template v-slot:body="props">
                            <q-tr :props="props">
                                <template v-for="col in props.cols">
                                    <template v-if="col.name === 'highestBid' || col.name === 'sold'">
                                        <q-td :key="col.name" :props="props">
                                            <div>
                                                {{ numberWithCommas(Number(dd2hns(col.value))) }} HNS
                                            </div>
                                            <div v-if="coinprices.handshake">
                                                {{ formatCurrency('USD', dd2hns(col.value) * coinprices.handshake) }}
                                            </div>
                                        </q-td>
                                    </template>
                                    <template v-else-if="col.name === 'opened' || col.name === 'released'">
                                        <q-td :key="col.name" :props="props">
                                            {{ Math.abs(height - col.value) }} blocks {{table.tab != 'unreleased' ? 'ago' : ''}}
                                        </q-td>
                                    </template>
                                    <template v-else-if="col.name === 'closingBlock'">
                                        <q-td :key="col.name" :props="props">
                                            {{ Math.abs(col.value - height) }} blocks
                                        </q-td>
                                    </template>
                                    <template v-else-if="col.name === 'revealingBlock'">
                                        <q-td :key="col.name" :props="props">
                                            {{ Math.abs(col.value - height) }} blocks
                                        </q-td>
                                    </template>
                                    <template v-else-if="col.name === 'remove'">
                                        <q-td :key="col.name" :props="props">
                                            <q-btn round icon="mdi-close" @click="$delete(result[table.tab], col.value)" />
                                        </q-td>
                                    </template>
                                    <template v-else>
                                        <q-td :key="col.name" :props="props">
                                            {{col.value}}
                                        </q-td>
                                    </template>
                                </template>
                            </q-tr>
                        </template>

                    </q-table>
                </div>
            </q-tab-panel>

        </q-tab-panels>
        
    </div>
</template>

<script>
import punycode from 'punycode';
import { mapGetters } from 'vuex';

var boData = () => {
    return {
        bidoverlay: {
            open: false,
            waiting: false,
            bid: 0.0,
            blind: 0.0,
            foshizzle: false,
        },
    };
};

export default {
    name: 'Marketplace',
    data() {
        return {
            result: {
                open: [],
                released: [], // available
                unreleased: [],
                reserved: [],
                claimed: [],
            },
            ...boData(),
            tab: 'bid',
            table: {
                tab: 'released',
                columns: {
                    // { domain, opened, closingBlock, views, watchers, highestBid }
                    open: [
                        {
                            label: 'Domain',
                            name: 'domain',
                            field: 'domain',
                            align: 'center',
                            sortable: true,
                            format: (v) => this.decodePuny(v),
                        },
                        {
                            label: 'Highest Bid',
                            name: 'highestBid',
                            field: 'highestBid',
                            align: 'center',
                            sortable: true,
                        },
                        {
                            label: 'Opened', // x blocks ago
                            name: 'opened',
                            field: 'opened',
                            align: 'center',
                            sortable: true,
                        },
                        {
                            label: 'Reveals in',
                            name: 'revealingBlock',
                            field: 'revealingBlock',
                            align: 'center',
                            sortable: true,
                        },
                        {
                            label: 'Closes in',
                            name: 'closingBlock',
                            field: 'closingBlock',
                            align: 'center',
                            sortable: true,
                        },
                        {
                            label: 'Watchers',
                            name: 'watchers',
                            field: 'watchers',
                            align: 'center',
                            sortable: true,
                        },
                    ],
                    unreleased: [
                        {
                            label: 'Domain',
                            name: 'domain',
                            field: 'domain',
                            align: 'center',
                            sortable: true,
                            format: (v) => this.decodePuny(v),
                        },
                        {
                            label: 'Views',
                            name: 'views',
                            field: 'views',
                            align: 'center',
                            sortable: true,
                        },
                        {
                            label: 'Watchers',
                            name: 'watchers',
                            field: 'watchers',
                            align: 'center',
                            sortable: true,
                        },
                        {
                            label: 'Releasing in',
                            name: 'released',
                            field: 'released',
                            align: 'center',
                            sortable: true,
                        },
                    ],
                    // { domain, views, watchers, released }
                    released: [
                        {
                            label: 'Domain',
                            name: 'domain',
                            field: 'domain',
                            align: 'center',
                            sortable: true,
                            format: (v) => this.decodePuny(v),
                        },
                        {
                            label: 'Views',
                            name: 'views',
                            field: 'views',
                            align: 'center',
                            sortable: true,
                        },
                        {
                            label: 'Watchers',
                            name: 'watchers',
                            field: 'watchers',
                            align: 'center',
                            sortable: true,
                        },
                        {
                            label: 'Released',
                            name: 'released',
                            field: 'released',
                            align: 'center',
                            sortable: true,
                        },
                        {
                            name: 'remove',
                            field: 'remove',
                        },
                    ],
                    // { domain, views, watchers }
                    reserved: [
                        {
                            label: 'Domain',
                            name: 'domain',
                            field: 'domain',
                            align: 'center',
                            sortable: true,
                            format: (v) => this.decodePuny(v),
                        },
                        {
                            label: 'Views',
                            name: 'views',
                            field: 'views',
                            align: 'center',
                            sortable: true,
                        },
                        {
                            label: 'Watchers',
                            name: 'watchers',
                            field: 'watchers',
                            align: 'center',
                            sortable: true,
                        },
                    ],
                    // { domain, sold, views, watchers, highestBid }
                    claimed: [
                        {
                            label: 'Domain',
                            name: 'domain',
                            field: 'domain',
                            align: 'center',
                            sortable: true,
                            format: (v) => this.decodePuny(v),
                        },
                        {
                            label: 'Sold For',
                            name: 'sold',
                            field: 'sold',
                            align: 'center',
                            sortable: true,
                        },
                        {
                            label: 'Views',
                            name: 'views',
                            field: 'views',
                            align: 'center',
                            sortable: true,
                        },
                        {
                            label: 'Watchers',
                            name: 'watchers',
                            field: 'watchers',
                            align: 'center',
                            sortable: true,
                        },
                        {
                            label: 'Highest Bid',
                            name: 'highestBid',
                            field: 'highestBid',
                            align: 'center',
                            sortable: true,
                        },
                    ],
                },
            },
            form: {
                loading: false,
                progress: 0,
                powerSearch: '',
            },
            coinprices: [],
            blockheight: 0,
        };
    },
    computed: {
        ...mapGetters(['getCoinPrices', 'height']),
    },
    watch: {
        height(to) {
            this.blockheight = to;
        },
        getCoinPrices(to) {
            this.coinprices = to;
        },
    },
    mounted() {
        this.coinprices = this.getCoinPrices;
    },
    methods: {
        ...mapGetters(['namebase']),
        decodePuny(_in) {
            let out = punycode.toUnicode(_in);
            if (_in === out) {
                return `${_in}/`;
            }
            return `${_in}/ (${out})`;
        },
        conformData(_in) {
            let tmp = [];
            for (var key in _in) {
                tmp.push({
                    domain: _in[key].name,
                    opened: _in[key].openBlock,
                    closingBlock: _in[key].closeBlock,
                    views: _in[key].numberViews,
                    watchers: _in[key].numWatching,
                    highestBid: _in[key].highestStakeAmount,
                    released: _in[key].releaseBlock,
                    revealingBlock: _in[key].revealBlock,
                    sold: _in[key].closeAmount,
                    remove: key,
                });
            }
            return tmp;
        },
        closeOverlay() {
            this.bidoverlay.open = false;
            Object.assign(this.$data, boData());
        },
        append(tarr, inarr) {
            if (!tarr.find((v) => v.name === inarr.name)) {
                this.$set(tarr, tarr.length, inarr);
            }
        },
        bidOnReleased() {
            if (this.bidoverlay.bid + this.bidoverlay.blind < 0.4) {
                console.error(
                    'Need to have more than, or equal to 0.4 HNS per bid fuckface.',
                );
                return;
            }
            var del = [];
            var powerBid = (i) => {
                this.namebase()
                    .user()
                    .bid(
                        this.result.released[i].name,
                        Number(this.bidoverlay.bid).toFixed(2),
                        Number(this.bidoverlay.blind).toFixed(2),
                        (err, status, result) => {
                            if (err) {
                                console.error(err);
                            }

                            console.log(status, result);

                            this.form.progress =
                                (i + 1) / this.result.released.length;

                            if (i == this.result.released.length - 1) {
                                this.$delete(this.result.released, i);
                                this.$store.dispatch('GET_BIDS');

                                for (var k in del) {
                                    this.$delete(this.result.released, del[k]);
                                }

                                setTimeout(() => {
                                    this.form.progress = 0;
                                }, 30000);

                                Object.assign(this.$data, boData());
                            }

                            if (result.success) {
                                del.push(i);
                            }

                            if (
                                result.success &&
                                i < this.result.released.length - 1
                            ) {
                                powerBid(i + 1);
                            }
                        },
                    );
            };
            powerBid(0);
            this.bidoverlay.open = false;
            // still need to clear info from overlay after loop
            /*var testPowerBid = (i) => {
                setTimeout(() => {
                    var data = this.result.released[i];
                    console.log(
                        `Setting a ${this.bidoverlay.bid} hns bid on "${data.name}" with a ${this.bidoverlay.blind} hns blind.`,
                    );
                    this.form.progress = (i + 1) / this.result.released.length;
                    if (i == this.result.released.length - 1) {
                        console.warn('Updating bids');
                        this.$store.dispatch('GET_BIDS');
                    } else {
                        testPowerBid(i + 1);
                    }
                }, 300);
            };
            testPowerBid(0);*/
        },
        getDomains() {
            var powerSearch = (i, search) => {
                try {
                    if (search[i].length == 0) {
                        this.form.powerSearch = this.form.powerSearch.replace(
                            /^\s*$(?:\r\n?|\n)/gm,
                            '',
                        );
                        powerSearch(i + 1, search);
                        return;
                    }
                } catch {
                    powerSearch(i + 1, search);
                    return;
                }

                this.namebase()
                    .domains()
                    .auction(search[i], (err, status, result) => {
                        var dna = false;
                        if (err) console.error(err);

                        console.log(result.name);

                        if (result.reserved) {
                            this.append(this.result.reserved, result);
                            dna = true;
                        }

                        if (result.closeAmount) {
                            this.append(this.result.claimed, result);
                            dna = true;
                        } else if (result.highestStakeAmount) {
                            this.append(this.result.open, result);
                            dna = true;
                        }

                        if (result.height < result.releaseBlock) {
                            this.append(this.result.unreleased, result);
                            dna = true;
                        }

                        if (
                            !this.result.released.find(
                                (v) => v.name === result.name,
                            ) &&
                            !dna
                        ) {
                            this.$set(
                                this.result.released,
                                this.result.released.length,
                                result,
                            );
                        }

                        console.log(`[${i}] ${search[i]}`);

                        this.form.powerSearch = this.form.powerSearch.replace(
                            search[i] + '\n',
                            '',
                        );

                        if (i < search.length - 1) {
                            powerSearch(i + 1, search);
                        } else {
                            this.form.powerSearch = this.form.powerSearch.replace(
                                search[i],
                                '',
                            );
                            this.form.loading = false;
                        }
                    });
            };
            this.form.loading = true;
            powerSearch(0, this.form.powerSearch.split('\n'));
        },
    },
};
</script>

<style>
</style>