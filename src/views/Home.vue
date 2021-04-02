<template>
    <div class="home q-pa-md">
        <q-overlay v-model="overlay.open" cursor-type="default" no-scroll z-index="5000">
            <template v-slot:body>
                <div class="fullscreen row justify-center items-center">
                    <template v-if="overlay.open && overlay.waiting">
                        <q-spinner color="yellow" size="3em"></q-spinner>
                        <div class="text-h5 text-grey-6">Taking too long?</div>
                        <q-btn label="Cancel" color="negative" flat outline @click="overlay.open = false" />
                    </template>
                    <q-card style="width: 500px;" v-if="overlay.open && !overlay.waiting">
                        <q-card-section>
                            <div class="text-h5 q-mt-sm text-center text-grey-4">{{ overlay.market.marking ? 'Mark Domain' : 'Edit Market Info' }}</div>
                            <div class="text-h6 q-mb-sm text-center text-bold text-grey-4">{{ decodePuny(overlay.domain.domain) }}</div>

                            <q-input 
                                v-model="overlay.market.value"
                                label="Value(in HNS)"
                                :hint="overlay.market.value > 0 ? `Current market value: ${numberWithCommas(overlay.market.value)} x ${numberWithCommas(coinprices.handshake)} = $${numberWithCommas((overlay.market.value * coinprices.handshake).toFixed(2))}` : `Currently 1 HNS = $${coinprices.handshake}`"
                                type="number"
                                color="green-5"
                                class="q-ma-sm"
                                square
                            />

                            <q-input 
                                v-model="overlay.market.description"
                                label="Description"
                                hint="A short something.. idk.. fuck!"
                                color="orange-5"
                                class="q-ma-sm"
                                square
                            />

                            <div class="q-my-md">
                                <table style="margin: auto;">
                                    <tbody>
                                        <template v-if="dd2hns(overlay.domain.purchasePrice) > 0">
                                            <tr>
                                                <td style="padding-right: 10px;text-align: right;">Paid</td>
                                                <td class="text-grey-5">{{ dd2hns(overlay.domain.purchasePrice) }}</td>
                                            </tr>
                                            <tr>
                                                <td></td>
                                                <td class="text-grey-5">${{ numberWithCommas((dd2hns(overlay.domain.purchasePrice) * coinprices.handshake).toFixed(2)) }}</td>
                                            </tr>
                                        </template>
                                        <tr>
                                            <td style="padding-right: 10px;text-align: right;">Commission(3%)</td>
                                            <td :class="{'text-red-5': overlay.market.fee > 0, 'text-grey-5': overlay.market.fee === 0}">{{overlay.market.fee > 0 ? '-' : ''}}{{ numberWithCommas((overlay.market.value * 0.03)) }} HNS</td>
                                        </tr>
                                        <tr>
                                            <td></td>
                                            <td :class="{'text-red-5': overlay.market.fee > 0, 'text-grey-5': overlay.market.fee === 0}">{{overlay.market.fee > 0 ? '-' : ''}}${{ numberWithCommas((overlay.market.fee * coinprices.handshake).toFixed(2)) }}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding-right: 10px;text-align: right;">Est. Profit</td>
                                            <td class="text-positive">{{ numberWithCommas(overlay.market.value - (overlay.market.value * 0.03)) }} HNS</td>
                                        </tr>
                                        <tr>
                                            <td></td>
                                            <td class="text-positive">${{ numberWithCommas(((((overlay.market.value - dd2hns(overlay.domain.purchasePrice)) * (coinprices.handshake || 0)) - overlay.market.fee)).toFixed(2)) }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </q-card-section>

                        <q-card-section>
                            <q-btn-group spread>
                                <q-btn flat outline label="Mark Domain" color="primary" @click="markDomain()" v-if="overlay.market.marking" />
                                <q-btn flat outline label="Save" color="positive" @click="markDomain()" v-else />
                                <q-btn flat outline label="Cancel" color="negative" @click="overlay.open = false" />
                            </q-btn-group>
                        </q-card-section>
                    </q-card>
                </div>
            </template>
        </q-overlay>
        <template v-if="!reactive.loadingTable">
            <q-table
                dark
                :data="conformData(domains)"
                :columns="table.columns"
                :pagination="{ rowsPerPage: 15 }"
                style="width: 100%"
                max-height="100%"
                class="q-table-sticky"
            >

                <template v-slot:top-right>
                    <q-btn-group>
                        <q-btn color="purple" @click="exportTable()">Export CSV</q-btn>
                    </q-btn-group>
                </template>

                <template v-slot:body="props">
                    <q-tr :props="props">
                        <template v-for="col in props.cols">
                            <template v-if="col.name === 'listPrice' || col.name === 'purchasePrice' || col.name === 'markedPrice'">
                                <q-td :key="col.name" :props="props">
                                    <template v-if="col.value >= 0">
                                        <div>
                                            {{ numberWithCommas(Number(dd2hns(col.value))) }} HNS
                                        </div>
                                        <div v-if="coinprices.handshake">
                                            {{ formatCurrency('USD', dd2hns(col.value) * coinprices.handshake) }}
                                        </div>
                                    </template>
                                    <template v-else>N/A</template>
                                </q-td>
                            </template>
                            <template v-else-if="col.name === 'domain'">
                                <q-td :key="col.name" :props="props">
                                    {{ decodePuny(col.value) }}
                                </q-td>
                            </template>
                            <template v-else-if="col.name === 'renewalBlock'">
                                <q-td :key="col.name" :props="props">
                                    {{ numberWithCommas(Math.abs(blockheight - col.value)) }} blocks
                                </q-td>
                            </template>
                            <template v-else-if="col.name === 'options'">
                                <q-td :key="col.name" :props="props">
                                    <!-- options should be an object, id should be name, should be unique -->
                                    <q-btn round size="0.8rem">
                                        <q-icon name="mdi-dots-vertical" />
                                        <q-menu auto-close>
                                            <q-item clickable @click="() => {overlay.market.marking = true; openOverlay('market', props.row);}" v-if="!isMarked(props.row.domain)">
                                                <q-item-section>Mark For Sale</q-item-section>
                                            </q-item>
                                            <q-item clickable @click="openOverlay('market', props.row)">
                                                <q-item-section>Edit Market Info</q-item-section>
                                            </q-item>
                                            <q-item clickable>
                                                <q-item-section>Edit DNS Info</q-item-section>
                                            </q-item>
                                            <q-item clickable class="bg-blue-10" v-if="props.row.listPrice > -1">
                                                <q-item-section>Unlist Domain</q-item-section>
                                            </q-item>
                                            <q-item clickable class="bg-blue-10" v-else>
                                                <q-item-section>List Domain</q-item-section>
                                            </q-item>
                                        </q-menu>
                                    </q-btn>
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
        </template>
        <template v-else>
            <skeleton-table dark :columns="6" :rows="10" />
        </template>
    </div>
</template>

<script>
import { remote } from 'electron';
import { mapGetters } from 'vuex';
import { exportFile } from 'quasar';
import SkeletonTable from '../components/skeletonTable.vue';

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

    return formatted;
}

var Overlay = () => {
    return {
        overlay: {
            open: false,
            waiting: false,
            type: 'market', // market, dns
            domain: {}, // Domain information?
            market: {
                fee: 0,
                value: 0, // value in hns
                description: '',
                marking: false,
            },
            dns: {
                fee: 0,
                records: [
                    /*{
                        host: 'ns1',
                        ttl: 10800,
                        type: 'NS',
                        value: '44.231.6.183'
                    }*/
                ],
            },
        },
    };
};

export default {
    name: 'Home',
    components: {
        'skeleton-table': SkeletonTable,
    },
    data() {
        return {
            reactive: {
                loadingTable: true,
                reloadInterval: false,
            },
            table: {
                columns: [
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
                        sort: (a, b) => b - a,
                    },
                    {
                        label: 'Renews in',
                        name: 'renewalBlock',
                        field: 'renewalBlock',
                        align: 'center',
                        sortable: true,
                        sort: (a, b) => b - a,
                    },
                    {
                        label: 'Purchase Price',
                        name: 'purchasePrice',
                        field: 'purchasePrice',
                        align: 'center',
                        sortable: true,
                        sort: (a, b) => b - a,
                    },
                    {
                        label: 'List Price',
                        name: 'listPrice',
                        field: 'listPrice',
                        align: 'center',
                        sortable: true,
                        sort: (a, b) => b - a,
                    },
                    {
                        label: 'Marked Price',
                        name: 'markedPrice',
                        field: 'markedPrice',
                        align: 'center',
                        sortable: true,
                        sort: (a, b) => b - a,
                    },
                    {
                        name: 'options',
                        field: 'options',
                        align: 'center',
                    },
                ],
            },
            ...Overlay(),
            waiting: false,
            fullscreen: false,
            blockheight: -1,
            coinprices: [],
            domains: [],
        };
    },
    methods: {
        markDomain() {
            this.$store.dispatch('MARK_DOMAIN', {
                domain: this.overlay.domain.domain,
                price: parseInt(this.overlay.market.value),
                description: this.overlay.market.description,
            });

            this.overlay.open = false;
        },
        openOverlay(type, domain) {
            //console.log(domain);
            this.overlay.type = type;
            this.overlay.domain = domain;
            this.overlay.waiting = true;
            this.overlay.open = true;

            if (type === 'market') {
                if (this.overlay.market.marking) {
                    this.overlay.market.value = Math.abs(
                        this.dd2hns(domain.listPrice).split('.')[0] || 0,
                    );
                    // We can ask to load this info in the future
                    this.namebase()
                        .Domain(domain.domain)
                        .then(({ data, status }) => {
                            if (data.success && data.listing != null) {
                                this.overlay.market.value = this.dd2hns(
                                    data.listing.amount,
                                ).split('.')[0];

                                this.overlay.market.description =
                                    data.listing.description;
                            }

                            this.overlay.waiting = false;
                        });
                } else {
                    var marked = this.markedDomains.find(
                        (x) => x.domain === domain.domain,
                    );
                    if (marked) {
                        this.overlay.market.value = marked.price;
                        this.overlay.market.description = marked.description;
                    } else {
                        this.overlay.market.value = Math.abs(
                            this.dd2hns(domain.listPrice).split('.')[0] || 0,
                        );
                    }

                    this.overlay.waiting = false;
                }
            } else if (type === 'dns') {
                this.namebase()
                    .DNS.Get(domain.domain)
                    .then(({ data, status }) => {
                        console.log(data, status);
                    });
            }
        },
        organizeDomains() {
            this.domains = this.domains.sort(
                (a, b) => a.renewalBlock - b.renewalBlock,
            );
        },
        exportTable() {
            // naive encoding to csv format
            const content = [
                this.table.columns.map((col) => wrapCsvValue(col.label)),
            ]
                .concat(
                    this.conformData(this.domains).map((row) =>
                        this.table.columns
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
        appendDomains(_in) {
            if (!_in) return;
            for (var key in _in) {
                var index = this.domains.findIndex(
                    (e) => e.name === _in[key].name,
                );
                this.$set(
                    this.domains,
                    index > -1 ? index : this.domains.length,
                    _in[key],
                );
            }
        },
        conformData(_in) {
            let tmp = [];
            for (var key in _in) {
                var amount = -1;
                var close = -1;
                if (!!_in[key].amount) {
                    amount = _in[key].amount;
                }

                if (Number.isInteger(_in[key].data.closeAmount)) {
                    close = Number(_in[key].data.closeAmount);
                }

                var marked = this.markedDomains.find(
                    (x) => x.domain === _in[key].name,
                );

                if (marked) {
                    marked = this.hns2dd(marked.price);
                }

                tmp.push({
                    domain: _in[key].name,
                    views: _in[key].data.numberViews,
                    renewalBlock: _in[key].renewalBlock,
                    purchasePrice: close,
                    listPrice: amount,
                    markedPrice: marked,
                    options: _in[key],
                });
            }
            return tmp;
        },
        ...mapGetters(['namebase']),
    },
    computed: {
        ...mapGetters([
            'height',
            'getCoinPrices',
            'listedDomains',
            'domainsLoaded',
            'notlistedDomains',
            'transferredDomains',
            'domainsLength',
            'markedDomains',
        ]),
        isMarked() {
            return (domain) => {
                return (
                    this.markedDomains.findIndex((x) => x.domain == domain) > -1
                );
            };
        },
    },
    watch: {
        listedDomains: {
            handler(to) {
                this.appendDomains(to);
                this.organizeDomains();
            },
            deep: true,
        },
        notlistedDomains: {
            handler(to) {
                this.appendDomains(to);
                this.organizeDomains();
            },
            deep: true,
        },
        transferredDomains: {
            handler(to) {
                this.appendDomains(to);
                this.organizeDomains();
            },
            deep: true,
        },
        domainsLength(to) {
            this.appendDomains(this.listedDomains);
            this.appendDomains(this.notlistedDomains);
            this.appendDomains(this.transferredDomains);
            this.organizeDomains();
        },
        height(to) {
            this.blockheight = to;
        },
        getCoinPrices(to) {
            this.coinprices = to;
        },
        domainsLoaded(to) {
            this.reactive.loadingTable = !to;
        },
        'overlay.market.value'(to) {
            if (to > 0) {
                this.overlay.market.fee = to * 0.03;
                //console.log(this.overlay.market.fee);
            }
        },
        'overlay.open'(to) {
            if (!to) {
                // reset overlay
                Object.assign(this.$data, Overlay());
            }
        },
    },
    beforeUpdate() {
        this.reactive.loadingTable = !this.domainsLoaded;
    },
    mounted() {
        this.reactive.loadingTable = !this.domainsLoaded;
        this.coinprices = this.getCoinPrices;
        this.blockheight = this.height;
        this.appendDomains(this.listedDomains);
        this.appendDomains(this.notlistedDomains);
        this.appendDomains(this.transferredDomains);
        this.organizeDomains();
        this.reactive.reloadInterval = setInterval(() => {
            if (
                !this.reactive.loadingTable &&
                remote.BrowserWindow.getAllWindows()[0].isFocused()
            ) {
                //console.log('Fetching domains for updates...');
                this.$store.dispatch('GET_DOMAINS');
            }
        }, 15000);
    },
    beforeDestroy() {
        clearInterval(this.reactive.reloadInterval);
    },
};
</script>

<style lang="scss">
.q-table-sticky {
    .q-table__middle {
        max-height: calc(100vh - 296px);
        overflow-y: auto;
    }

    .q-table__top,
    .q-table__bottom,
    thead tr:first-child th {
        z-index: 1000;
        background-color: #1a1a1a;
    }

    thead tr:first-child th {
        position: sticky;
        top: 0;
    }
}
</style>