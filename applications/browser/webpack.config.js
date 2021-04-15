/**
 * This file can be edited to customize webpack configuration.
 * To reset delete this file and rerun theia build again.
 */

/*

// @ts-check
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const frontend = require('./gen-webpack.config.js');

// #region Webpack 5 compatibility
// Bogus:
delete frontend.node;
// Use new CopyPlugin API:
const copyPlugin = frontend.plugins.find(plugin => plugin instanceof CopyPlugin);
// @ts-ignore
copyPlugin.options = { patterns: copyPlugin.options };
// Missing Buffer namespace
// @ts-ignore
frontend.plugins.push(new webpack.ProvidePlugin({
    Buffer: ['buffer', 'Buffer'],
}))
// @ts-ignore
frontend.plugins.push(new webpack.DefinePlugin({
    // *Immediate functions are not defined in the browser:
    'clearImmediate': 'clearTimeout',
    'setImmediate': 'setTimeout',
    // Someone used Node's process.env in the browser impl...
    'process.env': '{}',
}));
// Convert old loader notation (loader!xyz and loader?a=1&b=2):
for (const rule of frontend.module.rules) {
    if (typeof rule.loader === 'string') {
        if (rule.loader.includes('!')) {
            const [a, b] = rule.loader.split('!', 2);
            delete rule.loader;
            rule.use = [a, b];
        } else if (rule.loader.includes('?')) {
            const [loader, search] = rule.loader.split('?', 2);
            const options = Object.create(null);
            for (const entry of search.split('&')) {
                const [key, value] = entry.split('=', 2);
                options[key] = value;
            }
            rule.loader = loader;
            rule.options = options;
        }
    }
}
// Empty polyfills for Node APIs:
frontend.resolve.fallback = Object.assign(frontend.resolve.fallback || {}, {
    'child_process': false,
    'crypto': false,
    'net': false,
    'path': false,
    'process': false,
    'os': false,
    'timers': false
});
// Config worker-loader using the new API:
const workerRule = frontend.module.rules.find(rule => rule.loader === 'worker-loader');
workerRule.options.filename = workerRule.options.name.replace('[hash]', '[fullhash]');
delete workerRule.options.name;
// Show more errors
frontend.stats.children = true;
frontend.stats.errorDetails = true;
// #endregion Webpack 5 compatibility

// Move everything directly into the bundled Node application.
frontend.output.path = 'bundled/lib';

*/

/**
 * Expose bundled modules on window.theia.moduleName namespace, e.g.
 * window['theia']['@theia/core/lib/common/uri'].
 * Such syntax can be used by external code, for instance, for testing.
config.module.rules.push({
    test: /\.js$/,
    loader: require.resolve('@theia/application-manager/lib/expose-loader')
}); */

module.exports = require('./web-webpack.config');
