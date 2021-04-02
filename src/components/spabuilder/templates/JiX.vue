<template>
    <div class="main-content">
        <div class="overflow-hidden sidebar">
            <div class="logo">{{ logo }}</div>
            <div class="slogan" v-html="slogan"></div>
            <div class="navigation" v-html="extra"></div>
        </div>
        <div class="overflow-scroll-y flex-grow-1 content">

            <template v-for="(domains, category) in categorizedDomains">
                <h2>{{ category }}</h2>
                <div class="domains">
                    <a 
                        v-for="domain in domains"
                        class="d-inline-flex domain open" 
                        target="_blank" 
                        :href="`https://www.namebase.io/domains/${domain}`"
                    >
                        {{ decodePuny(domain, true).replace('/', '') }}
                    </a>
                </div>
            </template>
        </div>
    </div>
</template>

<script>
export default {
    name: 'JiX__template',
    props: {
        logo: String,
        slogan: String,
        extra: String,
        contact: String,
        contactHref: String,
        categorizedDomains: Object,
    },
};
</script>