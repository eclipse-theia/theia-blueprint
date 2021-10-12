const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

/** @type {import('webpack').Configuration['mode']} */
const mode = 'production';

/** @type {import('webpack').EntryObject} */
const commonJsLibraries = {};
for (const [entryPointName, entryPointPath] of Object.entries({
    'backend-init-theia': '@theia/plugin-ext/lib/hosted/node/scanners/backend-init-theia',
    'nsfw-watcher': '@theia/filesystem/lib/node/nsfw-watcher',
    'plugin-vscode-init': '@theia/plugin-ext-vscode/lib/node/plugin-vscode-init',
})) {
    commonJsLibraries[entryPointName] = {
        import: require.resolve(entryPointPath),
        library: {
            type: 'commonjs2',
        },
    };
}

const ignoredResources = new Set([
    'node-ssh',
    'vertx'
]);

/** @type {import('webpack').Configuration} */
module.exports = {
    mode,
    devtool: mode === 'development' ? 'source-map' : false,
    target: 'node',
    node: {
        global: false,
        __filename: false,
        __dirname: false
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'bundled')
    },
    entry: {
        // Main entry point of the Theia application backend:
        'blueprint': require.resolve('./src-gen/backend/main'),
        // Theia's IPC mechanism:
        'ipc-bootstrap': require.resolve('@theia/core/lib/node/messaging/ipc-bootstrap'),
        // VS Code extension support:
        'plugin-host': require.resolve('@theia/plugin-ext/lib/hosted/node/plugin-host'),
        // Make sure the node-pty thread worker can be executed:
        'worker/conoutSocketWorker': require.resolve('node-pty/lib/worker/conoutSocketWorker'),
        ...commonJsLibraries
    },
    externals: {
        child_process: 'commonjs2 child_process'
    },
    module: {
        parser: {
            javascript: {
                // `@theia/core` `dynamicRequire` function requires Webpack's magic comments
                // to allow dynamic requires. Otherwise Webpack will replace any dynamic require
                // call by a hardcoded function that throws an error when invoked.
                commonjsMagicComments: true,
            },
        },
        rules: [
            // Make sure we can still find and load our native addons.
            {
                test: /\.node$/,
                loader: 'node-loader',
                options: {
                    name: 'native/[name].[ext]'
                }
            },
            // jsonc-parser exposes its UMD implementation by default, which
            // confuses Webpack leading to missing js in the bundles.
            {
                test: /node_modules[\\/](jsonc-parser)/,
                loader: 'umd-compat-loader'
            }
        ]
    },
    plugins: [
        // The bindings module does a lot of disk crawling which breaks when bundled.
        // Instead we'll hardcode the native imports so that it can be statically analyzed.
        new webpack.NormalModuleReplacementPlugin(/^bindings$/, path.resolve('replacements/bindings.js')),
        // The ripgrep binary is in a different location once bundled.
        new webpack.NormalModuleReplacementPlugin(/^vscode-ripgrep$/, path.resolve('replacements/vscode-ripgrep.js')),
        // The ApplicationPackage's logic tries to find the Theia Extensions on disk, but when bundled+packaged this breaks.
        // The idea is to pre-compute what's included in the application into a JSON and use this information instead.
        new webpack.NormalModuleReplacementPlugin(/\/webpack-extension-packages$/, path.resolve('src-gen/backend/extension-packages.json')),
        // Something in the plugin-host-rpc logic doesn't work with Webpack's numerical module IDs.
        new webpack.NormalModuleReplacementPlugin(/\/plugin-host-rpc$/, resource => {
            if (/[/\\]plugin-ext[/\\]/.test(resource.context)) {
                resource.request = path.resolve('replacements/plugin-host-rpc.js');
            }
        }),
        // Webpack trips on the places where those modules are required.
        // Since we'll never reach the code paths where they actually are required at runtime,
        // it is safe to completely ignore them. Webpack will throw an error if they are required.
        new webpack.IgnorePlugin({
            checkResource: resource => ignoredResources.has(resource)
        })
    ],
    optimization: {
        // Split and reuse code across the various entry points
        splitChunks: {
            chunks: 'all'
        },
        // Only minimize if we run webpack in production mode
        minimize: mode === 'production',
        minimizer: [
            new TerserPlugin({
                exclude: /^(lib|builtins)\//
            })
        ]
    },
};
