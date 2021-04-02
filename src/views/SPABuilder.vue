<template>
    <div class="q-ma-md q-pa-md bg-dark" style="height: calc(100vh - 186px);position: relative;">
        <div style="height: 100%;">
            <div class="spa-container">
                <div class="options">
                    <q-tabs 
                        inline-label
                        v-model="optionTab"
                        class="text-grey-5"
                    >
                        <q-tab name="meta" label="Content" />
                        <q-tab name="categories" label="Categories" />
                        <q-tab name="domains" label="Domains" />
                        <q-tab name="colors" label="Colors" />
                    </q-tabs>

                    <q-separator />
                    
                    <q-scroll-area style="height: calc(100% - 79px)">
                        <q-tab-panels v-model="optionTab" animated>

                            <q-tab-panel name="meta" style="padding-left: 8px;padding-right: 24px;">
                                <q-form>
                                    <q-input 
                                        square
                                        filled
                                        v-model="options.content.title"
                                        label="Logo"
                                        color="positive"
                                        hint="Logo text"
                                        style="padding-bottom: 28px;"
                                    />
                                    <q-input
                                        square
                                        filled
                                        clearable
                                        autogrow
                                        v-model="options.content.description"
                                        color="primary"
                                        label="Slogan"
                                        hint="Slogan of your page fucko"
                                        style="padding-bottom: 28px;"
                                    />
                                    <q-input
                                        square
                                        filled
                                        clearable
                                        autogrow
                                        v-model="options.content.navigation"
                                        color="negative"
                                        label="Navigation"
                                        hint="Secondary description"
                                        style="padding-bottom: 28px;"
                                    />
                                </q-form>

                                <q-separator />

                                <h5 class="q-my-sm text-center">Meta</h5>

                                <q-form>
                                    <q-input 
                                        square
                                        filled
                                        v-model="options.meta.pageTitle"
                                        label="Page Title"
                                        color="positive"
                                        hint="Title of the tab"
                                        style="padding-bottom: 28px;"
                                    />
                                    <q-input
                                        square
                                        filled
                                        clearable
                                        autogrow
                                        v-model="options.meta.pageDescription"
                                        color="primary"
                                        label="Page Description"
                                        hint="Description of your page fucko"
                                        style="padding-bottom: 28px;"
                                    />
                                    <q-input
                                        square
                                        filled
                                        clearable
                                        autogrow
                                        v-model="options.meta.pageTags"
                                        color="negative"
                                        label="Page Tags"
                                        hint="Tags seperated by commas"
                                        style="padding-bottom: 28px;"
                                    />
                                </q-form>
                            </q-tab-panel>

                            <q-tab-panel name="categories">
                                <q-dialog position="left" v-model="domainsModal.open">
                                    <q-card>
                                        <q-card-section>
                                            <div class="text-h6 text-center">Owned Domains <q-btn icon="mdi-reload" color="grey-10" class="text-green-5 q-ml-sm" round @click="hardRefresh()" /></div>
                                        </q-card-section>

                                        <q-card-section>
                                            <q-input square clearable label="Search domains..." ref="dmFilter" v-model="domainsModal.filter.search" hint="Bottom result info will not match results of search" />
                                        </q-card-section>

                                        <q-card-section class="q-py-none">
                                            <q-scroll-area style="height: 55vh;width: 375px;">
                                                <q-list dense>
                                                    <q-item
                                                        v-for="(domain, i) in domainsModal.domains"
                                                    >
                                                        <q-item-section>
                                                            <q-checkbox size="sm" val="xs" :label="decodePuny(domain.name)" :value="domainsModal.selected.findIndex((x) => x === domain.name) >= 0" @input="(v,e) => checkDomain(v, domain.name)" />
                                                        </q-item-section>
                                                    </q-item>
                                                </q-list>
                                            </q-scroll-area>
                                            <q-separator />
                                            <table style="width: 100%;">
                                                <tbody>
                                                    <tr>
                                                        <td>
                                                            <a href="#" class="text-blue-6" @click="selectAll(false)">Select All</a>
                                                        </td>
                                                        <td class="text-grey" style="padding-right: 3ps;text-align: right;">{{ cache.domains.length }} domains :: {{ cache.usedDomains.length }} hidden | {{((domainsModal.filter.page - 1) * domainsModal.filter.rows) || 1}}/{{((domainsModal.filter.page) * domainsModal.filter.rows) > (cache.domains.length - cache.usedDomains.length) ? (cache.domains.length - cache.usedDomains.length) : ((domainsModal.filter.page) * domainsModal.filter.rows)}} of {{ cache.domains.length - cache.usedDomains.length }}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </q-card-section>

                                        <q-card-actions align="center">
                                            <q-pagination
                                                v-model="domainsModal.filter.page"
                                                :max="domainsModal.filter.max"
                                                :input="true"
                                            >
                                            </q-pagination>
                                        </q-card-actions>

                                        <q-card-actions align="right">
                                            <q-btn flat label="Add Domains" @click="addDomains()" />
                                            <q-btn flat label="Close" v-close-popup />
                                        </q-card-actions>
                                    </q-card>
                                </q-dialog>

                                <div class="q-gutter-md q-mb-md">
                                    <q-form @submit="addCategory">
                                        <q-input type="text" square color="positive" label="New category name" v-model="newCategory" ref="newCategory">
                                            <template v-slot:after>
                                                <q-btn icon="mdi-plus" outline round color="positive" @click="addCategory" />
                                            </template>
                                        </q-input>
                                    </q-form>
                                </div>
                                <q-list 
                                    bordered
                                    v-if="Object.keys(template.categories).length > 0"
                                >
                                    <template
                                        v-for="(domains, i) in categorizeDomains"
                                    >
                                        <q-expansion-item
                                            group="somegroup"
                                            header-class="text-white"
                                            :key="i"
                                        >
                                            <template v-slot:header>
                                                <table style="width: 100%;align-items:center;" class="text-center">
                                                    <tbody>
                                                        <tr>
                                                            <td style="width: 50%;">{{ i }}</td>
                                                            <td>{{ domains.length }} domains</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </template>
                                            <q-card>
                                                <q-card-section>
                                                    <q-btn-group spread class="q-mb-sm">
                                                        <q-btn flat outline size="0.7rem" color="positive" label="Add Domain" icon="mdi-plus" @click="() => {toggleDomainsModal();domainsModal.category = catId(i);}" />
                                                        <q-btn flat outline size="0.7rem" color="negative" label="Delete Category" icon="mdi-trash-can-outline" @click="deleteCategory(i)" />
                                                    </q-btn-group>

                                                    <q-list>
                                                        <template
                                                            v-for="(domain, y) in domains"
                                                        >
                                                            <q-slide-item right-color="red" @right="(e) => slideDelete(e, domain, i, y)">
                                                                <template v-slot:right>
                                                                    Delete <q-icon name="mdi-trash-can-outline" />
                                                                </template>

                                                                <q-item>
                                                                    <q-item-section class="text-center">
                                                                        {{ decodePuny(domain) }}
                                                                    </q-item-section>
                                                                </q-item>
                                                            </q-slide-item>
                                                            <q-separator v-if="y != Object.keys(domains)[Object.keys(domains).length - 1]" />
                                                        </template>
                                                    </q-list>

                                                </q-card-section>
                                            </q-card>
                                        </q-expansion-item>
                                        <q-separator v-if="i != Object.keys(categorizeDomains)[Object.keys(categorizeDomains).length - 1]" />
                                    </template>
                                </q-list>
                                <template v-else>
                                    <h5 class="text-center">No categories yet.</h5>
                                </template>
                            </q-tab-panel>

                            <q-tab-panel name="domains">
                                <q-list 
                                    bordered
                                    v-if="Object.keys(template.domains).length > 0"
                                >
                                    <template
                                        v-for="(domains, i) in categorizeDomains"
                                    >
                                        <q-expansion-item
                                            group="somegroup"
                                            header-class="text-white"
                                            v-for="(domain, y) in domains"
                                            :key="`${i}-${y}`"
                                        >
                                            <template v-slot:header>
                                                <table style="width: 100%;align-items:center;" class="text-center">
                                                    <tbody>
                                                        <tr>
                                                            <td style="width: 50%;">{{ domain }}</td>
                                                            <td>{{ i }}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </template>
                                            <q-card>
                                                <q-card-section>
                                                    <q-btn-group spread class="q-mb-sm">
                                                        <q-btn flat outline size="0.7rem" color="negative" label="Delete Domain" icon="mdi-trash-can-outline" @click="deleteDomain(domain)" />
                                                    </q-btn-group>
                                                    <!--q-card>
                                                        <q-card-section>
                                                            <q-select
                                                                filled
                                                                square
                                                                v-model="single"
                                                                :options="categoriesArray"
                                                                label="Category"
                                                                color="positive"
                                                            />
                                                        </q-card-section>
                                                    </q-card-->
                                                </q-card-section>
                                            </q-card>
                                        </q-expansion-item>
                                        <q-separator v-if="i != Object.keys(categorizeDomains)[Object.keys(categorizeDomains).length - 1]" />
                                    </template>
                                </q-list>
                                <template v-else>
                                    <h5 class="text-center">No domains yet.</h5>
                                </template>
                            </q-tab-panel>

                            <q-tab-panel name="colors">
                                <h5 class="q-mb-sm q-mt-none">Sidebar</h5>
                                <q-input
                                    filled
                                    square
                                    v-model="template.sidebar.bg.colors[0]"
                                    :rules="['anyColor']"
                                    hint="Sidebar Background Color Top"
                                    class="q-mb-sm"
                                >
                                    <template v-slot:append>
                                        <q-icon name="mdi-eyedropper-variant" class="cursor-pointer">
                                            <q-popup-proxy transition-show="scale" transition-hide="scale">
                                                <q-color v-model="template.sidebar.bg.colors[0]" />
                                            </q-popup-proxy>
                                        </q-icon>
                                    </template>
                                    <template v-slot:after>
                                        <div :style="`height: 100%;width: 35px;background: ${template.sidebar.bg.colors[0]}`"></div>
                                    </template>
                                </q-input>

                                <q-input
                                    filled
                                    square
                                    v-model="template.sidebar.bg.colors[1]"
                                    :rules="['anyColor']"
                                    hint="Sidebar Background Color Bottom"
                                    class="q-mb-sm"
                                >
                                    <template v-slot:append>
                                        <q-icon name="mdi-eyedropper-variant" class="cursor-pointer">
                                            <q-popup-proxy transition-show="scale" transition-hide="scale">
                                                <q-color v-model="template.sidebar.bg.colors[1]" />
                                            </q-popup-proxy>
                                        </q-icon>
                                    </template>
                                    <template v-slot:after>
                                        <div :style="`height: 100%;width: 35px;background: ${template.sidebar.bg.colors[1]}`"></div>
                                    </template>
                                </q-input>

                                <q-input
                                    filled
                                    square
                                    v-model="template.sidebar.text"
                                    :rules="['anyColor']"
                                    hint="Sidebar Text"
                                    class="q-mb-sm"
                                >
                                    <template v-slot:append>
                                        <q-icon name="mdi-eyedropper-variant" class="cursor-pointer">
                                            <q-popup-proxy transition-show="scale" transition-hide="scale">
                                                <q-color v-model="template.sidebar.text" />
                                            </q-popup-proxy>
                                        </q-icon>
                                    </template>
                                    <template v-slot:after>
                                        <div :style="`height: 100%;width: 35px;background: ${template.sidebar.text}`"></div>
                                    </template>
                                </q-input>

                                <q-separator />

                                <h5 class="q-my-sm">Content</h5>

                                <q-input
                                    filled
                                    square
                                    v-model="template.content.bg.colors[0]"
                                    :rules="['anyColor']"
                                    hint="Background Top Color"
                                    class="q-mb-sm"
                                >
                                    <template v-slot:append>
                                        <q-icon name="mdi-eyedropper-variant" class="cursor-pointer">
                                            <q-popup-proxy transition-show="scale" transition-hide="scale">
                                                <q-color v-model="template.content.bg.colors[0]" />
                                            </q-popup-proxy>
                                        </q-icon>
                                    </template>
                                    <template v-slot:after>
                                        <div :style="`height: 100%;width: 35px;background: ${template.content.bg.colors[0]}`"></div>
                                    </template>
                                </q-input>

                                <q-input
                                    filled
                                    square
                                    v-model="template.content.bg.colors[1]"
                                    :rules="['anyColor']"
                                    hint="Background Bottom Color"
                                    class="q-mb-sm"
                                >
                                    <template v-slot:append>
                                        <q-icon name="mdi-eyedropper-variant" class="cursor-pointer">
                                            <q-popup-proxy transition-show="scale" transition-hide="scale">
                                                <q-color v-model="template.content.bg.colors[1]" />
                                            </q-popup-proxy>
                                        </q-icon>
                                    </template>
                                    <template v-slot:after>
                                        <div :style="`height: 100%;width: 35px;background: ${template.content.bg.colors[1]}`"></div>
                                    </template>
                                </q-input>

                                <q-separator />

                                <h5 class="q-my-sm">Domain</h5>

                                <q-input 
                                    filled 
                                    square 
                                    v-model="template.content.domain.border.thickness"
                                    hint="Domain border thickness"
                                    type="number"
                                    class="q-mb-sm"
                                >
                                    <template v-slot:append>
                                        <span style="font-size: 1rem;">px</span>
                                    </template>
                                </q-input>

                                <q-input
                                    filled
                                    square
                                    v-model="template.content.domain.border.color"
                                    :rules="['anyColor']"
                                    hint="Domain border color"
                                    class="q-mb-sm"
                                >
                                    <template v-slot:append>
                                        <q-icon name="mdi-eyedropper-variant" class="cursor-pointer">
                                            <q-popup-proxy transition-show="scale" transition-hide="scale">
                                                <q-color v-model="template.content.domain.border.color" />
                                            </q-popup-proxy>
                                        </q-icon>
                                    </template>
                                    <template v-slot:after>
                                        <div :style="`height: 100%;width: 35px;background: ${template.content.domain.border.color}`"></div>
                                    </template>
                                </q-input>

                                <q-input
                                    filled
                                    square
                                    v-model="template.content.domain.text"
                                    :rules="['anyColor']"
                                    hint="Domain text color"
                                    class="q-mb-sm"
                                >
                                    <template v-slot:append>
                                        <q-icon name="mdi-eyedropper-variant" class="cursor-pointer">
                                            <q-popup-proxy transition-show="scale" transition-hide="scale">
                                                <q-color v-model="template.content.domain.text" />
                                            </q-popup-proxy>
                                        </q-icon>
                                    </template>
                                    <template v-slot:after>
                                        <div :style="`height: 100%;width: 35px;background: ${template.content.domain.text}`"></div>
                                    </template>
                                </q-input>

                            </q-tab-panel>

                        </q-tab-panels>

                        <!-- SAVE DIALOG -->
                        <q-dialog position="left" v-model="saveDialog.open">
                            <q-card>
                                <q-card-section>
                                    <div class="text-h6 text-center">Save Template</div>
                                    <q-input square label="Template name" v-model="saveDialog.name" hint="The name of your template" />
                                </q-card-section>

                                <q-card-actions align="right">
                                    <q-btn flat label="Save template" @click="saveTemplate" />
                                    <q-btn flat label="Close" v-close-popup />
                                </q-card-actions>
                            </q-card>
                        </q-dialog>
                    </q-scroll-area>

                    <q-btn-group spread class="q-mt-sm">
                        <q-btn flat outline size="0.7rem" color="positive" label="Export HTML" icon="mdi-file-export-outline" @click="save()" />
                        <q-btn flat outline size="0.7rem" color="primary" label="Import Template" icon="mdi-file-import-outline" @click="importTemplate" />
                    </q-btn-group>
                </div>
                <div class="output">
                    <i-frame class="iframe-out" :css="css" :headers="header" ref="iframeOut" :key="options.buildNo"
                            :bodyClasses="['index-page','d-md-flex','align-items-stretch']">
                        <JiX
                            :categorizedDomains="categorizeDomains"
                            :logo="options.content.title"
                            :slogan="options.content.description"
                            :extra="options.content.navigation"
                        />
                    </i-frame>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import fs from 'fs';
import JiX from '@/components/spabuilder/templates/JiX.vue';
import { mapMutations, mapGetters, mapState } from 'vuex';

const { dialog } = require('electron').remote;

export default {
    name: 'SPABuilder',
    components: {
        JiX,
    },
    data() {
        return {
            optionTab: 'meta',
            options: {
                meta: {
                    pageTags: '',
                    pageTitle: '',
                    pageDescription: '',
                },
                content: {
                    title: '',
                    description: '',
                    navigation: '',
                },
                buildNo: 0,
            },
            newCategory: '',
            cache: {
                domains: [],
                usedDomains: [],
            },
            saveDialog: {
                open: false,
                name: '',
            },
            domainsModal: {
                open: false,
                category: -1,
                domains: [], // remove added domains
                selected: [],
                filter: {
                    search: '',
                    max: 1,
                    page: 1,
                    rows: 50,
                },
            },
            template: {
                categories: {
                    /*1: 'My Domains',
                    2: 'Second',
                    5: 'Fith',*/
                },
                domains: {
                    /*1: ['lougle'],
                    2: [
                        'nadomains',
                        'someshit',
                        'dsfdsf',
                        'somdsfdsfeshit',
                        'iyuouiy',
                        '5346',
                    ],
                    5: ['another-domain', 'someshit'],*/
                },
                sidebar: {
                    bg: {
                        direction: 'to bottom',
                        colors: ['#005BF3', '#00a8f6'],
                    },
                    text: '#ffffff',
                },
                content: {
                    bg: {
                        direction: '5deg',
                        colors: ['#e9ecef', '#ffffff'],
                    },
                    domain: {
                        border: {
                            thickness: '3',
                            type: 'solid',
                            color: '#dadada',
                        },
                        text: '#093b8e',
                    },
                },
            },
        };
    },
    methods: {
        importTemplate() {
            dialog
                .showOpenDialog({
                    title: 'Open Template File',
                    filters: [
                        { name: 'JSON File', extensions: ['json'] },
                        { name: 'All Files', extensions: ['*'] },
                    ],
                    properties: ['openFile'],
                })
                .then(({ canceled, filePaths }) => {
                    if (!canceled) {
                        fs.readFile(filePaths[0], 'utf8', (err, data) => {
                            if (err) {
                                console.error(err);
                                return;
                            }
                            //console.log(JSON.parse(data));
                            Object.assign(this.$data, JSON.parse(data));
                            // Add already used domains to remove overlap.
                            for (var row in this.template.domains) {
                                //console.log(row, this.cache.usedDomains.length);
                                this.cache.usedDomains.push(
                                    ...this.template.domains[row],
                                );
                                //console.log(row, this.cache.usedDomains.length);
                            }

                            this.$q.notify({ message: 'Loaded template' });
                        });
                    }
                });
        },
        selectAll(deselect = false) {
            for (var index in this.domainsModal.domains) {
                this.checkDomain(
                    !deselect,
                    this.domainsModal.domains[index].name,
                );
            }
        },
        saveTemplate() {
            this.$store.dispatch('SAVE_SPATEMPLATE', {
                name: this.saveDialog.name,
                categories: this.template.categories,
                domains: this.template.domains,
                sidebar: this.template.sidebar,
                content: this.template.content,
            });

            this.saveDialog.open = false;
        },
        searchDomains() {
            var temp = this.excludeUsed(this.cache.domains).filter(
                (x) => x.name.indexOf(this.domainsModal.filter.search) > -1,
            );

            //console.log(temp);
        },
        hardRefresh() {
            this.cache.domains = this.spreadDomains();
            //this.domainsModal.filter.page
            this.limitedDomains(this.domainsModal.filter.page);
        },
        limitedDomains(page = 1) {
            this.domainsModal.domains = [];

            var temp = [];
            var newIndex = 0;
            var rows = this.domainsModal.filter.rows;
            var domainLen =
                this.cache.domains.length - this.cache.usedDomains.length;

            if (this.domainsModal.filter.search.length > 0) {
                temp = this.excludeUsed(this.cache.domains).filter(
                    (x) => x.name.indexOf(this.domainsModal.filter.search) > -1,
                );
                domainLen = temp.length;
            } else {
                temp = this.excludeUsed(this.cache.domains);
            }

            this.domainsModal.filter.max = Math.ceil(domainLen / rows);

            for (
                var i = (page - 1) * this.domainsModal.filter.rows;
                i < page * this.domainsModal.filter.rows;
                i++
            ) {
                if (i > domainLen - 1) break;

                this.$set(this.domainsModal.domains, newIndex++, temp[i]);
            }
        },
        excludeUsed(domains) {
            return domains.filter(
                (x) => this.cache.usedDomains.indexOf(x.name) == -1,
            );
        },
        addDomains() {
            new Promise((res, rej) => {
                for (var i = 0; i < this.domainsModal.selected.length; i++) {
                    //console.log(this.domainsModal.selected[i]);
                    var fIndex = this.domainsModal.domains.findIndex(
                        (x) => x.name === this.domainsModal.selected[i],
                    );

                    if (fIndex >= 0) {
                        if (
                            !this.template.domains[this.domainsModal.category]
                        ) {
                            this.$set(
                                this.template.domains,
                                this.domainsModal.category,
                                [],
                            );
                        }

                        this.template.domains[this.domainsModal.category].push(
                            this.domainsModal.selected[i],
                        );

                        this.$set(
                            this.cache.usedDomains,
                            this.cache.usedDomains.length,
                            this.domainsModal.selected[i],
                        );
                        //this.$delete(this.domainsModal.domains, fIndex);
                    }
                }
                res();
            }).then(() => {
                this.toggleDomainsModal(false);
            });
        },
        toggleDomainsModal(force = null) {
            if (force != null) {
                this.domainsModal.open = force;
            } else {
                this.domainsModal.open = !this.domainsModal.open;
            }
        },
        checkDomain(value, domain) {
            if (value) {
                this.$set(
                    this.domainsModal.selected,
                    this.domainsModal.selected.length,
                    domain,
                );
            } else {
                var index = this.domainsModal.selected.findIndex(
                    (x) => x === domain,
                );
                if (index >= 0) {
                    this.$delete(this.domainsModal.selected, index);
                }
            }
        },
        addCategory() {
            if (this.newCategory.length == 0) return;
            var big = -1;
            for (var cat in this.template.categories) {
                // strictly check if there's a match
                if (
                    this.template.categories[cat].toLowerCase() ===
                    this.newCategory.toLowerCase()
                ) {
                    this.newCategory = '';
                    this.$q.notify({
                        message: 'Category already exists!',
                        color: 'negative',
                    });
                    return;
                }
                big = parseInt(cat) > parseInt(big) ? cat : big;
            }

            this.$set(
                this.template.categories,
                big == -1
                    ? Object.keys(this.template.categories).length
                    : parseInt(big) + 1,
                this.newCategory,
            );
            this.newCategory = '';
            this.$q.notify({
                message: 'New category added',
                color: 'positive',
            });
        },
        deleteCategory(category) {
            for (var cat in this.template.categories) {
                if (this.template.categories[cat] === category) {
                    this.$delete(this.template.categories, cat);
                    for (var domain in this.template.domains[cat]) {
                        var index = this.cache.usedDomains.indexOf(
                            this.template.domains[cat][domain],
                        );

                        if (index > -1) {
                            this.$delete(this.cache.usedDomains, index);
                        }
                    }
                    this.$delete(this.template.domains, cat);
                }
            }
        },
        deleteDomain(domain) {
            for (var catIndex in this.template.domains) {
                for (var domIndex in this.template.domains[catIndex]) {
                    if (this.template.domains[catIndex][domIndex] === domain) {
                        this.$delete(this.template.domains[catIndex], domIndex);
                        break;
                    }
                }
            }
            var used = this.cache.usedDomains.indexOf(domain);
            if (used > -1) {
                this.$delete(this.cache.usedDomains, used);
            }

            this.hardRefresh();

            //this.$q.notify({ message: 'Deleted domain', color: 'positive' });
        },
        slideDelete(e, domain, i, y) {
            this.deleteDomain(domain);

            //console.error(e, domain, i, y);

            this.$q.notify({
                message: `Deleted domain from category`,
                color: 'positive',
            });

            e.reset();
        },
        save() {
            var options = {
                title: 'Save file',
                defaultPath: 'My SPA',
                buttonLabel: 'Save',

                filters: [
                    { name: 'html', extensions: ['html'] },
                    { name: 'All Files', extensions: ['*'] },
                ],
            };

            dialog.showSaveDialog(null, options).then(({ filePath }) => {
                fs.writeFileSync(
                    filePath,
                    '<!DOCTYPE html>' +
                        this.$refs.iframeOut.$el.contentWindow.document
                            .documentElement.outerHTML,
                    'utf-8',
                );

                fs.writeFileSync(
                    filePath + '.json',
                    JSON.stringify({
                        options: this.options,
                        template: this.template,
                    }),
                );

                this.$q.notify({
                    message: 'Saved SPA',
                    color: 'positive',
                });
            });
        },
        ...mapGetters(['spreadDomains']),
    },
    computed: {
        css() {
            return `body {
                min-height: 100%;
            }
            html, body { height: 100%; }
            .sidebar { min-width: 220px; padding: 20px; background-color: #005BF3; background: linear-gradient(${
                this.template.sidebar.bg.direction
            }, ${this.template.sidebar.bg.colors.join(',')}); color: ${
                this.template.sidebar.text
            }; }
            .content { padding: 20px; background-color: #F2F2F2; background: linear-gradient(${
                this.template.content.bg.direction
            }, ${this.template.content.bg.colors.join(',')}); }
            .content h2 { color: #333; margin-bottom: 12px; font-size: 1.4rem; text-transform: uppercase; }
            .content .domain {     
                border-radius: 3px;
                padding: 10px 18px;
                margin-right: 5px;
                margin-bottom: 5px;
                text-decoration: none;
                background: transparent !important;
                color: ${this.template.content.domain.text} !important;
                font-weight: bold;
                border: ${this.template.content.domain.border.thickness}px ${
                this.template.content.domain.border.type
            } ${this.template.content.domain.border.color};
            }

            .content .domain:hover {
                opacity: .8;
            }

            .content .domains { margin-bottom: 62px; margin-left: 12px; }

            .logo {
                font-weight: bold;
                font-size: 3rem;
                text-align: center;
            }

            .slogan {
                margin-bottom: 30px;
                text-align: center;
            }

            .navigation {
                text-align: center;
            }

            .navigation ul {
                list-style: none;
                margin: 0;
                padding: 0;
            }

            .overflow-scroll-y {
                overflow-y: auto;
                overflow-x: hidden;
            }

            main, .main-content { display: contents; }

            @media (min-width: 768px) {
                .content {
                    padding: 44px 100px;
                }
                .sidebar {
                    width: 15%;
                }
            }`;
        },
        header() {
            return [
                '<meta charset="utf-8">',
                `<title>${this.options.meta.pageTitle}</title>`,
                `<meta name="keywords" content="${this.options.meta.pageTags}">`,
                `<meta name="description" content="${this.options.meta.pageDescription}">`,
                '<meta name="author" content="Black Mamba - Justice Master">',
                '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
                '<meta http-equiv="x-ua-compatible" content="ie=edge">',
                '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1" crossorigin="anonymous">',
                '<meta name="msapplication-TileColor" content="#2b5797">',
                '<meta name="theme-color" content="#ffffff">',
            ];
        },
        categoriesArray() {
            var out = [];
            for (var catIndex in this.template.categories) {
                out.push(this.template.categories[catIndex]);
            }
            return out;
        },
        categorizeDomains() {
            var outObj = {};
            for (var category in this.template.domains) {
                if (outObj[this.template.categories[category] || 'N/A']) {
                    this.$set(
                        outObj,
                        this.template.categories[category] || 'N/A',
                        [
                            ...outObj[
                                this.template.categories[category] || 'N/A'
                            ],
                            ...this.template.domains[category],
                        ],
                    );
                } else {
                    this.$set(
                        outObj,
                        this.template.categories[category] || 'N/A',
                        this.template.domains[category],
                    );
                }
            }

            // Add empty categories for SPA builder, TODO: Detect this on the template!!!
            for (var catIndex in this.template.categories) {
                if (!outObj[this.template.categories[catIndex]]) {
                    this.$set(outObj, this.template.categories[catIndex], []);
                }
            }

            return outObj;
        },
        catId() {
            return (category) => {
                for (var fIndex in this.template.categories) {
                    if (this.template.categories[fIndex] === category) {
                        return parseInt(fIndex);
                    }
                }
                return -1;
            };
        },
    },
    watch: {
        'options.meta': {
            handler(to) {
                this.options.buildNo++;
            },
            deep: true,
        },
        template: {
            handler(to) {
                this.options.buildNo++;
            },
            deep: true,
        },
        'domainsModal.open'(to) {
            if (!to) {
                this.domainsModal.selected = [];
                this.domainsModal.category = -1;
                this.domainsModal.filter.page = 1;
                this.domainsModal.filter.search = '';
                this.limitedDomains();
            } else {
                setTimeout(() => {
                    this.$refs.dmFilter.focus();
                }, 20);
            }
        },
        'domainsModal.filter.page'(to) {
            this.limitedDomains(to);
        },
        'domainsModal.filter.search'(to) {
            this.limitedDomains();
        },
    },
    mounted() {
        this.cache.domains = this.spreadDomains();
        this.limitedDomains();
    },
};
</script>

<style lang="scss">
.inline {
    &-flex {
        display: inline-flex;
    }

    &-block {
        display: inline-block;
    }
}

.iframe-out {
    box-shadow: none;
    height: 100%;
    width: 100%;
    display: block;
    position: relative;
    border: none;
}

.spa-container {
    height: 100%;
    width: 100%;
    display: table;
}
.options {
    width: 35%;
    height: 100%;
    display: table-cell;
    transition: width 0.08s ease-in;
    padding-right: 8px;
    vertical-align: top;
}

.output {
    width: 65%;
    height: 100%;
    display: table-cell;
    background-color: darken(#1d1d1d, 5%);
    transition: width 0.08s ease-in;
    border: 2.5px solid darken(#1d1d1d, 5%);
}

@media screen and (min-width: 1314px) {
    .options {
        width: 25%;
    }

    .output {
        width: 75%;
    }
}
</style>