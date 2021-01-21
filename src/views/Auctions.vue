<template>
    <div class="q-pa-md">
        
        <template v-if="!reactive.loadingTable">
            <q-table 
                dark    
                :data="conformData(reactive.bids[reactive.table])"
                :columns="reactive.table !== 'revealing' ? excludeIndex(table.columns, 2) : table.columns"
                :loading="table.loading"
                :pagination="{ rowsPerPage: 0, sortBy: 'closingBlock' }"
                max-height="100%"
                class="q-table-sticky"
            >

                <template v-slot:top>
                    <q-tabs
                        inline-label
                        v-model="reactive.table"
                        class="text-grey-5"
                    >
                        <q-tab name="open" icon="mdi-lock-open" label="Open">
                            <q-badge floating transparent v-if="reactive.bids.open && reactive.bids.open.length > 0">{{ reactive.bids.open.length }}</q-badge>
                        </q-tab>
                        <q-tab name="revealing" icon="mdi-eye" label="Reveal">
                            <q-badge color="orange" floating transparent v-if="reactive.bids.revealing && reactive.bids.revealing.length > 0">{{ reactive.bids.revealing.length }}</q-badge>
                        </q-tab>
                        <q-tab name="lost" icon="mdi-gavel" label="Lost">
                            <q-badge color="red" floating transparent v-if="reactive.bids.lost && reactive.bids.lost.length > 0">{{ reactive.bids.lost.length }}</q-badge>
                        </q-tab>
                    </q-tabs>
                </template>

                <template v-slot:no-data message="No data available" icon="mdi-folder-information">
                    <h2 style="width: 100%;" class="text-center">No data available</h2>
                </template>
                
                <template v-slot:body="props">
                    <q-tr :props="props">
                        <template v-for="col in props.cols">
                            <template v-if="col.name === 'highestBid'">
                                <q-td :key="col.name" :props="props">
                                    <div>
                                        {{ numberWithCommas(col.value) }} HNS
                                    </div>
                                    <div v-if="reactive.coinprices.handshake">
                                        {{ formatCurrency('USD', col.value * reactive.coinprices.handshake) }}
                                    </div>
                                </q-td>
                            </template>
                            <template v-else-if="col.name === 'myBid'">
                                <q-td :key="col.name" :props="props">
                                    <div>
                                        {{ numberWithCommas(col.value.bid) }} HNS<span class="text-grey-7" style="margin-left: 3px;" v-if="col.value.mask > 0"> + {{ numberWithCommas(Number(col.value.mask.toFixed(6))) }} HNS</span>
                                    </div>
                                    <div v-if="reactive.coinprices.handshake">
                                        {{ formatCurrency('USD', col.value.bid * reactive.coinprices.handshake) }}<span class="text-grey-7" style="margin-left: 3px;" v-if="col.value.mask > 0"> + {{ formatCurrency('USD', col.value.mask * reactive.coinprices.handshake) }}</span>
                                    </div>
                                </q-td>
                            </template>
                            <template v-else-if="col.name === 'closingBlock'">
                                <q-td :key="col.name" :props="props">
                                    <div v-if="col.value - reactive.blockheight > 0">
                                        {{ numberWithCommas(col.value - reactive.blockheight) }} blocks
                                    </div>
                                    <div class="text-grey-7" v-else>Closed</div>
                                </q-td>
                            </template>
                            <template v-else-if="col.name === 'winning'">
                                <q-td :key="col.name" :props="props">
                                    <div v-if="col.value" class="text-green-8">
                                        Winning!
                                    </div>
                                </q-td>
                            </template>
                            <template v-else-if="col.name === 'contextMenu'">
                                <q-td :key="col.name" :props="props" v-if="col.value">
                                    <q-btn round>
                                        <q-icon name="mdi-dots-vertical" />
                                        <q-menu auto-close>
                                            <q-item clickable>
                                                <q-item-section>View Auction</q-item-section>
                                            </q-item>
                                            <q-item clickable>
                                                <q-item-section>Set Alarm</q-item-section>
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
import punycode from 'punycode';
import { mapGetters } from 'vuex';
import SkeletonTable from '../components/skeletonTable.vue';

export default {
    name: 'Auctions',
    components: {
        'skeleton-table': SkeletonTable,
    },
    data() {
        return {
            table: {
                loading: false,
                columns: [
                    {
                        name: 'domain',
                        label: 'Domain',
                        align: 'center',
                        field: 'domain',
                        sortable: true,
                        format: (v) => this.decodePuny(v),
                    },
                    {
                        name: 'highestBid',
                        label: 'Highest Bid',
                        align: 'center',
                        field: 'highestBid',
                        sortable: true,
                    },
                    {
                        name: 'winning',
                        label: 'Winning',
                        align: 'center',
                        field: 'winning',
                        sortable: true,
                        sort: (a, b) => b - a,
                    },
                    {
                        name: 'myBid',
                        label: 'My Bid',
                        align: 'center',
                        field: 'myBid',
                        sortable: true,
                        sort: (a, b) => {
                            let at = a.bid + a.mask;
                            let bt = b.bid + b.mask;
                            return at - bt;
                        },
                    },
                    {
                        name: 'closingBlock',
                        label: 'Closes In',
                        align: 'center',
                        field: 'closingBlock',
                        sortable: true,
                    },
                    {
                        name: 'contextMenu',
                        align: 'center',
                        field: 'contextMenu',
                    },
                ],
            },
            reactive: {
                table: 'open',
                bids: {},
                loading: true,
                coinprices: [],
                blockheight: 0,
                reloadInterval: false,
            },
        };
    },
    methods: {
        conformData(_in) {
            let tmp = [];
            for (var key in _in) {
                tmp.push({
                    contextMenu: this.reactive.table === 'open',
                    winning: _in[key].data.userHasHighestBid,
                    domain: _in[key].domain,
                    highestBid:
                        Number(_in[key].data.highestMaskedBid) ||
                        Number(_in[key].data.highestBid),
                    myBid: this.getMyHighestBid(_in[key].data.userBids),
                    closingBlock:
                        (_in[key].data.closeBlock ||
                            _in[key].data.revealBlock) - this.reactive.height,
                });
            }
            return tmp;
        },
        getMyHighestBid(userBids) {
            let tmp = {
                bid: 0,
                mask: 0,
            };

            for (var key in userBids) {
                tmp.bid = Number(userBids[key].bidAmount);
                tmp.mask =
                    userBids[key].bidAmount > 0
                        ? Math.abs(
                              Number(userBids[key].bidAmount) -
                                  Number(userBids[key].bidAmountWithMask),
                          )
                        : Number(userBids[key].bidAmountWithMask);
            }

            return tmp;
        },
    },
    computed: {
        ...mapGetters([
            'height',
            'getCoinPrices',
            'namebaseState',
            'namebaseBids',
        ]),
    },
    watch: {
        height(to) {
            this.reactive.blockheight = to;
        },
        getCoinPrices(to) {
            this.reactive.coinprices = to;
        },
        /*namebaseBids: {
            handle(to) {
                this.reactive.bids = to;
            },
            deep: true,
        },*/
    },
    mounted() {
        this.reactive.bids = this.namebaseState.bids;
        this.reactive.height = this.namebaseState.height;
        this.reactive.coinprices = this.getCoinPrices;

        if (this.reactive.bids.open.length === 0) {
            if (this.reactive.bids.revealing.length === 0) {
                if (this.reactive.bids.lost.length != 0) {
                    this.reactive.table = 'lost';
                }
            } else {
                this.reactive.table = 'revealing';
            }
        }
        /*this.reactive.reloadInterval = setInterval(() => {
            this.$store.dispatch('GET_BIDS');
        }, 100000);*/
    },
    beforeDestroy() {
        clearInterval(this.reactive.reloadInterval);
    },
};
</script>

<style lang="scss">
.q-table-sticky {
    .q-table__middle {
        max-height: calc(100vh - 308px);
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