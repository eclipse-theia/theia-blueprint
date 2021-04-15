const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const { ModifySourcePlugin } = require('modify-source-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

/** @type {import('webpack').Configuration['mode']} */
const mode = 'production';

/** @type {import('webpack').Configuration} */
module.exports = {
    mode,
    target: 'node',
    devtool: mode === 'development' ? 'source-map' : false,
    // Since theia starts child processes we need to make sure that each
    // entry point is individually reachable by the system.
    // This list has to be updated based on what the included Theia extensions
    // are trying to spawn, this is has to be hand made for now:
    entry: {
        // Main entry point of the Theia application backend:
        'blueprint': require.resolve('./src-gen/backend/main'),
        // Theia's IPC mechanism:
        'ipc-bootstrap': require.resolve('@theia/core/lib/node/messaging/ipc-bootstrap'),
        // VS Code extension support:
        'plugin-host': require.resolve('@theia/plugin-ext/lib/hosted/node/plugin-host'),
        'backend-init-theia': {
            import: require.resolve('@theia/plugin-ext/lib/hosted/node/scanners/backend-init-theia'),
            library: {
                type: 'commonjs2'
            }
        },
        'plugin-vscode-init': {
            import: require.resolve('@theia/plugin-ext-vscode/lib/node/plugin-vscode-init'),
            library: {
                type: 'commonjs2'
            }
        },
        // NSFW service:
        'nsfw-watcher': {
            import: require.resolve('@theia/filesystem/lib/node/nsfw-watcher'),
            library: {
                type: 'commonjs2'
            }
        },
        // Git service:
        'git-locator-host': {
            import: require.resolve('@theia/git/lib/node/git-locator/git-locator-host'),
            library: {
                type: 'commonjs2'
            }
        }
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'bundled')
    },
    optimization: {
        // Split and reuse code across the various entry points:
        splitChunks: {
            chunks: 'all'
        },
        minimize: true,
        minimizer: [
            new TerserPlugin({
                exclude: /^(lib|builtins)\//
            })
        ]
    },
    resolve: {
        // Default order causes an issue with deepmerge that exposes both an esm
        // and cjs implementation. We expect to import cjs but webpack is linking
        // the esm instead, putting the implementation behind a "default" field.
        mainFields: ['main', 'module']
    },
    node: {
        global: false,
        __filename: false,
        __dirname: false
    },
    externals: {
        // Don't bundle drivelist and instead try to require it from disk as cjs.
        drivelist: 'commonjs2 drivelist',
        child_process: 'commonjs2 child_process'
    },
    plugins: [
        new webpack.NormalModuleReplacementPlugin(/^vscode-ripgrep$/, path.resolve('replacements/vscode-ripgrep.js')),
        new webpack.DefinePlugin({
            '_THEIA_BLUEPRINT_PACKAGE': JSON.stringify(require('./package.json'))
        }),
        // This is where madness begins. We have this ipc-bootstrap mechanism that is spawned
        // as a child process and proceeds to require a script as passed from environment variables.
        // The issue is that Webpack replaces every require call with its own __webpack_require__,
        // which in turn always throws when a dynamic import is done.
        // Since it is bad taste to taylor our sources to include __non_webpack_require__ which is
        // an escape hatch from Webpack's parsing, we'll use this plugin to replace the require
        // call by that Webpack magic method, on the fly. Erk.
        new ModifySourcePlugin({
            rules: [
                {
                    test: /(ipc-bootstrap|vscode-debug-adapter-contribution|hosted-instance-manager|hosted-plugins-manager|plugin-host-rpc|grammars-reader|plugin-theia-directory-handler|plugin-vscode-directory-handler)\.js$/,
                    modify(src) {
                        return src.replace(/ require\((?!["'])/g, ' __non_webpack_require__(');
                    }
                },
                {
                    test: /plugin-vscode-init\.js$/,
                    modify(src) {
                        return src.replace(' module = require(', ' module = __non_webpack_require__(');
                    }
                },
                {
                    test: /plugin-host-rpc\.js$/,
                    modify(src) {
                        return src.replace(/require\.cache/g, '__non_webpack_require__.cache');
                    }
                }
            ]
        }),
        // Webpack trips on the places where those modules are required.
        // Since we'll never reach the code paths where they actually are required at runtime,
        // it is safe to completely ignore them. Webpack will throw an error if they are required.
        new webpack.IgnorePlugin({
            checkResource: (resource) => [
                'node-ssh',
                'vertx'
            ].includes(resource)
        }),
        new CopyPlugin({
            patterns: [
                // Copy over ripgrep's binaries
                {
                    from: path.resolve(require.resolve('vscode-ripgrep/package.json'), '../bin/*').replace(/\\/g, '/'),
                    to: 'node_modules/vscode-ripgrep'
                },
                // #region drivelist copy
                // drivelist relies on the bindings package to find its own native module (.node),
                // which confuses webpack and the final output js. The fix implemented in this config
                // is to leave drivelist out of the bundle, and copy only the relevant files from it.
                {
                    from: path.resolve(require.resolve('drivelist/package.json'), '../js/**/*.js').replace(/\\/g, '/'),
                    to: 'node_modules/drivelist/'
                },
                ...[
                    'drivelist/build/Release/drivelist.node',
                    'drivelist/package.json'
                ].map(file => ({
                    from: require.resolve(file).replace(/\\/g, '/'),
                    to: 'node_modules/' + file,
                })),
                // #endregion drivelist copy
            ]
        })
    ],
    module: {
        rules: [
            // Make sure we can still find and load our native addons.
            // Since drivelist is specifically handled before, we'll skip it here:
            {
                test: /(?!drivelist)\.node$/,
                // test: /\.node$/,
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
    }
};
