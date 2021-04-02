<template>
    <div class="q-pa-md" ref="tvContainer">
        <!--trading-vue 
            :data="chart"
            :width="chart.width"
            colorBack="#121212"
            colorCandleUp="green"
            colorCandleDown="red"
            :charConfig="chart.config"
        /-->
        <!-- Calculators and shit because why not -->
    </div>
</template>

<script>
import CoinCap from 'coincapjs';
import TradingVue from 'trading-vue-js';
export default {
    name: 'thecoin',
    components: { TradingVue },
    data() {
        return {
            initiated: false,
            chart: {
                ohlcv: [],
                width: undefined,
                config: {
                    type: 'candles',
                    tf: 'm1',
                },
            },
        };
    },
    created() {
        //window.addEventListener('resize', this.setWidth);
    },
    mounted() {
        //this.loadCandles();
        //this.chart.width = this.$refs.tvContainer.clientWidth - 35;
    },
    destroyed() {
        //window.removeEventListener('resize', this.setWidth);
    },
    methods: {
        setWidth() {
            this.chart.width = this.$refs.tvContainer.clientWidth - 35;
        },
        loadCandles() {
            CoinCap.getCandles({
                exchange: 'bibox',
                interval: 'h8',
                baseId: 'ethereum',
                quoteId: 'bitcoin',
                cb: this.addCandlesHandle,
            });
        },
        addCandlesHandle(err, status, result) {
            if (err) {
                throw err;
            }

            if (result.data.length > 0) {
                for (var key in result.data) {
                    if (
                        !this.chart.ohlcv.find(
                            (e) => e.indexOf(result.data[key].period) > -1,
                        )
                    ) {
                        var data = [
                            result.data[key].period,
                            Number(result.data[key].open),
                            Number(result.data[key].high),
                            Number(result.data[key].low),
                            Number(result.data[key].close),
                            Number(result.data[key].volume),
                        ];
                        this.$set(
                            this.chart.ohlcv,
                            this.chart.ohlcv.length,
                            data,
                        );
                    }
                }

                this.chart.ohlcv = this.chart.ohlcv.sort((a, b) => a[0] - b[0]);
            }
        },
    },
};
</script>

<style>
</style>