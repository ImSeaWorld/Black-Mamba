<template>
  <div class="home">
    <h1>{{prices.bitcoin}}</h1>
    <input type="text" ref="yeet">
    <button @click="$store.dispatch('WATCH_COIN', $refs.yeet.value)">add</button>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
    name: 'Home',
    components: {},
    data() {
        return {
            prices: this.getPrices(),
        };
    },
    methods: {
        ...mapGetters(['getPrices']),
    },
};
</script>
