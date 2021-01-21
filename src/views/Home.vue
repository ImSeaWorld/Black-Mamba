<template>
    <div class="home q-pa-md">
        <q-overlay v-model="fullscreen" cursor-type="default" no-scroll z-index="5000">
            <template v-slot:body>
                <div class="fullscreen row justify-center items-center">
                    <q-spinner v-if="fullscreen && waiting" color="yellow" size="3em"></q-spinner>
                    <q-btn v-if="fullscreen && !waiting" color="primary" label="Exit" @click="fullscreen = !fullscreen"></q-btn>
                </div>
            </template>
        </q-overlay>
        <template v-if="!reactive.loadingTable">
            <q-table
                dark
                :data="conformData(domains)"
                :columns="table.columns"
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
                            <template v-if="col.name === 'listPrice' || col.name === 'purchasePrice'">
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
                                            <q-item clickable>
                                                <q-item-section>Mark For Sale</q-item-section>
                                            </q-item>
                                            <q-item clickable>
                                                <q-item-section>Edit Market Info</q-item-section>
                                            </q-item>
                                            <q-item clickable>
                                                <q-item-section>Edit DNS Info</q-item-section>
                                            </q-item>
                                            <q-item clickable class="bg-blue-10">
                                                <q-item-section>Unlist Domain</q-item-section>
                                            </q-item>
                                            <q-item clickable class="bg-blue-10">
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

    return `"${formatted}"`;
}

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
                    },
                    {
                        label: 'Renews in',
                        name: 'renewalBlock',
                        field: 'renewalBlock',
                        align: 'center',
                        sortable: true,
                    },
                    {
                        label: 'Purchase Price',
                        name: 'purchasePrice',
                        field: 'purchasePrice',
                        align: 'center',
                        sortable: true,
                    },
                    {
                        label: 'List Price',
                        name: 'listPrice',
                        field: 'listPrice',
                        align: 'center',
                        sortable: true,
                    },
                    {
                        name: 'options',
                        field: 'options',
                        align: 'center',
                    },
                ],
            },
            waiting: false,
            fullscreen: false,
            blockheight: -1,
            coinprices: [],
            domains: [],
        };
    },
    methods: {
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

                tmp.push({
                    domain: _in[key].name,
                    views: _in[key].data.numberViews,
                    renewalBlock: _in[key].renewalBlock,
                    purchasePrice: close,
                    listPrice: amount,
                    options: _in[key],
                });
            }
            return tmp;
        },
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
        ]),
    },
    watch: {
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
            if (!this.reactive.loadingTable) {
                console.log('Fetching domains for updates...');
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