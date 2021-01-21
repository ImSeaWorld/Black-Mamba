<template>
    <div class="q-ma-md q-pa-md bg-dark" style="min-height: calc(100vh - 186px);">
        <q-tabs
            inline-label
            v-model="tab"
            class="text-grey-5"
        >
            <q-tab name="search" label="Search" />
            <q-tab name="watching" label="Watching" />
            <q-tab name="bid" label="Power Bid" />
            <q-tab name="list" label="Power List" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>

            <q-tab-panel name="search">
            </q-tab-panel>

            <q-tab-panel name="watching">
            </q-tab-panel>

            <q-tab-panel name="bid">
                <powerBid :blockheight="height" :coinprices="coinprices" />
            </q-tab-panel>

            <q-tab-panel name="list">
            </q-tab-panel>

        </q-tab-panels>
        
    </div>
</template>

<script>
import punycode from 'punycode';
import { mapGetters } from 'vuex';
import { exportFile, Notify } from 'quasar';
import powerBid from '@/components/marketplace/powerBid.vue';

export default {
    name: 'Marketplace',
    data() {
        return {
            tab: 'bid',
            coinprices: {},
            blockheight: 0,
        };
    },
    components: {
        powerBid,
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
    },
};
</script>

<style>
</style>