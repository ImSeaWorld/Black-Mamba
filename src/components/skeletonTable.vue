<template>
    <q-markup-table :dark="dark">
        <thead>
            <tr>
                <th 
                    v-for="col in columns"
                    class="text-center"
                    :key="`skeleton-col-${col}`"
                    :style="`width: ${randomNumber(65, 90)}px`"
                >
                    <q-skeleton animation="blink" type="text" />
                </th>
            </tr>
        </thead>

        <tbody>
            <tr v-for="n in rows" :key="`skeleton-row-${n}`">
                <td class="text-center" v-for="col in columns">
                    <q-skeleton animation="blink" type="text" :width="`${randomNumber(25, 85)}px`" />
                </td>
            </tr>
        </tbody>
    </q-markup-table>
</template>

<script>
export default {
    name: 'skeletonTable',
    props: {
        columns: Number,
        rows: Number,
        dark: Boolean,
    },
    methods: {
        randomNumber(min, max) {
            return Math.floor(Math.random() * max) + min;
        },
    },
};
</script>

<style>
</style>