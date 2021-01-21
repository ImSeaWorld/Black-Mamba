<template>
    <div>
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
                    @keyup.ctrl.enter="!form.loading ? $store.dispatch('POWER_SEARCH', form.powerSearch) : undefined"
                />
            </div>
            <div class="row q-my-sm justify-left">
                <q-btn label="Search" color="primary" @click="$store.dispatch('POWER_SEARCH', form.powerSearch)" :disable="form.loading" />
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
                    <q-btn-group>
                        <q-btn color="green" v-if="result.released.length > 0 && table.tab === 'released'" @click="bidoverlay.open = true">Open Bids On Available</q-btn>
                        <q-btn color="purple" @click="exportTable()" :disable="result[table.tab].length == 0">Export CSV</q-btn>
                        <q-btn color="primary" @click="watchTable()" :disable="result[table.tab].length == 0">Watch All</q-btn>
                    </q-btn-group>
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
                                    {{ Math.abs(blockheight - col.value) }} blocks {{table.tab != 'unreleased' ? 'ago' : ''}}
                                </q-td>
                            </template>
                            <template v-else-if="col.name === 'domain'">
                                <q-td :key="col.name" :props="props">
                                    {{ decodePuny(col.value) }}
                                </q-td>
                            </template>
                            <template v-else-if="col.name === 'closingBlock'">
                                <q-td :key="col.name" :props="props">
                                    {{ Math.abs(col.value - blockheight) }} blocks
                                </q-td>
                            </template>
                            <template v-else-if="col.name === 'revealingBlock'">
                                <q-td :key="col.name" :props="props">
                                    {{ Math.abs(col.value - blockheight) }} blocks
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
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { exportFile, Notify } from 'quasar';

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

function wrapCsvValue(val, formatFn) {
    let formatted = formatFn !== void 0 ? formatFn(val) : val;

    formatted =
        formatted === void 0 || formatted === null ? '' : String(formatted);

    formatted = formatted.split('"').join('""');
    /**
     * Excel accepts \n and \r in strings, but some other CSV parsers do not
     * Uncomment the next two lines to escape new lines
     */
    // .split('\n').join('\\n')
    // .split('\r').join('\\r')

    return `"${formatted}"`;
}
let _cache = null;
export default {
    name: 'PowerBid',
    props: {
        coinprices: Object,
        blockheight: Number,
    },
    data() {
        return {
            ...boData(),
            result: {
                open: [],
                released: [], // available
                unreleased: [],
                reserved: [],
                claimed: [],
            },
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
        };
    },
    mounted() {
        var searchCache = this.namebaseSearch();
        this.result.open = searchCache.open;
        this.result.claimed = searchCache.claimed;
        this.result.reserved = searchCache.reserved;
        this.result.released = searchCache.released;
        this.result.unreleased = searchCache.unreleased;
    },
    methods: {
        ...mapGetters(['namebase', 'namebaseSearch']),
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
        exportTable() {
            // naive encoding to csv format
            const content = [
                this.table.columns[this.table.tab].map((col) =>
                    wrapCsvValue(col.label),
                ),
            ]
                .concat(
                    this.conformData(this.result[this.table.tab]).map((row) =>
                        this.table.columns[this.table.tab]
                            .map((col) =>
                                wrapCsvValue(
                                    typeof col.field === 'function'
                                        ? col.field(row)
                                        : row[
                                              col.field === void 0
                                                  ? col.name
                                                  : col.field
                                          ],
                                    col.format,
                                ),
                            )
                            .join(','),
                    ),
                )
                .join('\r\n');

            const status = exportFile(
                `${this.table.tab}-export.csv`,
                content,
                'text/csv',
            );

            if (status !== true) {
                Notify.create({
                    message: 'Browser denied file download...',
                    color: 'negative',
                    icon: 'warning',
                });
            }
        },
        bidOnReleased() {
            if (this.bidoverlay.bid + this.bidoverlay.blind < 0.4) {
                console.error(
                    'Need to have more than, or equal to 0.4 HNS per bid fuckface.',
                );
                return;
            }

            var noti = Notify.create({
                type: 'ongoing',
                message: `Bidding on ${this.result.released.length} domains`,
            });

            var del = [];
            var powerBid = (i) => {
                noti({
                    type: 'ongoing',
                    message: `Bidding on domain "${this.decodePuny(
                        this.result.released[i].name,
                    )}" ${i}/${this.result.released.length}`,
                });
                this.namebase()
                    .user()
                    .bid(
                        this.result.released[i].name,
                        Number(this.bidoverlay.bid).toFixed(6),
                        Number(this.bidoverlay.blind).toFixed(6),
                        (err, status, result) => {
                            if (err) {
                                console.error(err);
                                noti({
                                    type: 'negative',
                                    message: `Error bidding on domain "${this.decodePuny(
                                        this.result.released[i].name,
                                    )}"`,
                                });
                            }

                            console.log(status, result);

                            this.form.progress =
                                (i + 1) / this.result.released.length;

                            if (i == this.result.released.length - 1) {
                                this.$delete(this.result.released, i);
                                this.$store.dispatch('GET_BIDS');

                                noti({
                                    type: 'positive',
                                    message: `Bid on ${del.length} domains of ${this.result.released.length}`,
                                    timeout: 10000,
                                });

                                for (var k in del) {
                                    this.$delete(this.result.released, del[k]);
                                }

                                setTimeout(() => {
                                    this.form.progress = 0;
                                }, 10000);

                                Object.assign(this.$data, boData());
                            }

                            if (result.success) {
                                del.push(i);
                                noti({
                                    type: 'positive',
                                    message: `Placed bid on "${this.decodePuny(
                                        this.result.released[i].name,
                                    )}"`,
                                });
                            }

                            if (i < this.result.released.length - 1) {
                                powerBid(i + 1);
                            }
                        },
                    );
            };
            powerBid(0);
            this.bidoverlay.open = false;
        },
        watchTable() {
            if (this.result[this.table.tab].length == 0) {
                return;
            }

            var notification = Notify.create({
                type: 'ongoing',
                message: `Starting to watch ${
                    this.result[this.table.tab].length
                } domains`,
            });

            var del = [];

            var addWatch = (i) => {
                console.log(this.result[this.table.tab][i].name);
                console.log(
                    !this.result[this.table.tab].find(
                        (e) =>
                            e.name === this.result[this.table.tab][i].name &&
                            e.watching,
                    ),
                );
                if (
                    !this.result[this.table.tab].find(
                        (e) =>
                            e.name === this.result[this.table.tab][i].name &&
                            e.watching,
                    )
                ) {
                    this.namebase()
                        .domains()
                        .watch(
                            this.result[this.table.tab][i].name,
                            (err, status, result) => {
                                if (err) {
                                    notification({
                                        type: 'negative',
                                        message: `Error trying to watch domain "${
                                            this.result[this.table.tab][i].name
                                        }"`,
                                    });
                                    console.error(status, err, result);
                                }

                                if (result.success) {
                                    notification({
                                        type: 'positive',
                                        message: `Watching domain "${
                                            this.result[this.table.tab][i].name
                                        }"`,
                                    });
                                    del.push(i);
                                }

                                if (
                                    i ==
                                    this.result[this.table.tab].length - 1
                                ) {
                                    notification({
                                        type: 'positive',
                                        message: `Watching ${del.length}/${
                                            this.result[this.table.tab].length
                                        } domains`,
                                        timeout: 10000,
                                    });
                                }

                                if (
                                    i <
                                    this.result[this.table.tab].length - 1
                                ) {
                                    addWatch(i + 1);
                                }
                            },
                        );
                } else {
                    notification({
                        type: 'warning',
                        message: `Already watching "${
                            this.result[this.table.tab][i].name
                        }"`,
                    });

                    console.warn(
                        `Already watching "${
                            this.result[this.table.tab][i].name
                        }"`,
                    );

                    if (i == this.result[this.table.tab].length - 1) {
                        notification({
                            type: 'positive',
                            message: `Watching ${del.length}/${
                                this.result[this.table.tab].length
                            } domains`,
                            timeout: 10000,
                        });
                    }

                    if (i < this.result[this.table.tab].length - 1) {
                        addWatch(i + 1);
                    }
                }
            };
            addWatch(0);
        },
    },
};
</script>

<style>
</style>