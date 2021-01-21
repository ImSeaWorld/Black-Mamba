module.exports = {
    pluginOptions: {
        quasar: {
            importStrategy: 'kebab',
            rtlSupport: false,
        },
        electronBuilder: {
            nodeIntegration: true,
            enableRemoteModule: true,
            builderOptions: {
                appId: 'man-docs-er-shite',
                productName: 'Black Mamba',
                copyright: 'Copyright © 2021 ${author}',
            },
        },
    },
    transpileDependencies: ['quasar'],
};
