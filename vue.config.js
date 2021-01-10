module.exports = {
    pluginOptions: {
        quasar: {
            importStrategy: 'kebab',
            rtlSupport: false,
        },
        electronBuilder: {
            nodeIntegration: true,
            enableRemoteModule: true,
        },
    },
    transpileDependencies: ['quasar'],
};
