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
            <q-markup-table dark dense>
                <col style="width: 1px;">
                <col style="width: auto;">
                <col style="width: auto;">
                <col style="width: auto;">
                <col style="width: auto;">
                <col style="width: 1px;">
                <thead>
                    <tr>
                        <th></th>
                        <th class="text-center">Domain</th>
                        <th class="text-center">Views</th>
                        <th class="text-center">Renews In</th>
                        <th class="text-center">List Price</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr 
                        v-for="(domain, i) in domains" :key="`domain-${i}`"
                        :class="{ 'bg-blue-10': !!domain.amount }"
                    >
                        <td class="text-center"><q-icon name="mdi-playlist-check" size="1.5rem" v-if="!!domain.amount" /></td>
                        <td class="text-center">{{ decodePuny(domain.name) }}</td>
                        <td class="text-center">{{ domain.numberViews || 'N/A' }}</td>
                        <td class="text-center">{{ numberWithCommas(domain.renewalBlock - blockheight) }} blocks</td>
                        <td class="text-center">
                            <template v-if="!!domain.amount">
                                {{ formatdd2hns(domain.amount).slice(0, -4) + ' HNS' }} <span class="text-grey-5 q-pl-sm">{{ formatCurrency('USD', formatdd2hns(domain.amount) * coinprices.handshake) }}</span>
                            </template>
                            <template v-else>N/A</template>
                        </td>
                        <td>
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
                                    <q-item clickable class="bg-blue-10" v-if="!!domain.amount">
                                        <q-item-section>Unlist Domain</q-item-section>
                                    </q-item>
                                    <q-item clickable class="bg-blue-10" v-else>
                                        <q-item-section>List Domain</q-item-section>
                                    </q-item>
                                </q-menu>
                            </q-btn>
                        </td>
                        <q-tooltip anchor="center left" self="center start" content-class="bg-green" v-if="!!domain.amount">
                            Currently Listed
                        </q-tooltip>
                    </tr>
                </tbody>
            </q-markup-table>
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
            waiting: false,
            fullscreen: false,
            blockheight: -1,
            coinprices: [],
            domains: [],
        };
    },
    methods: {
        decodePuny(_in) {
            let out = punycode.toUnicode(_in);
            if (_in === out) {
                return `${_in}/`;
            }
            return `${_in}/ (${out})`;
        },
        organizeDomains() {
            this.domains = this.domains.sort(
                (a, b) => a.renewalBlock - b.renewalBlock,
            );
        },
        appendDomains(_in) {
            if (!_in) return;
            if (!this.domains.find((e) => e.name === _in.name)) {
                for (var key in _in) {
                    this.$set(this.domains, this.domains.length, _in[key]);
                }
            }
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
            console.log('Fetching domains for updates...');
            this.$store.dispatch('GET_DOMAINS');
        }, 15000);
    },
    beforeDestroy() {
        clearInterval(this.reactive.reloadInterval);
    },
};
</script>
