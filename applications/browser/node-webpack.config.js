/********************************************************************************
 * Copyright (C) 2020 Ericsson and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

/** @type {import('webpack').Configuration['entry']} */
const cjsEntryPoints = {};
/** @type {string[]} */
const spawnableCjsModules = {
    'nsfw-watcher': '@theia/filesystem/lib/node/nsfw-watcher',
    'git-locator-host': '@theia/git/lib/node/git-locator/git-locator-host',
    'backend-init-theia': '@theia/plugin-ext/lib/hosted/node/scanners/backend-init-theia',
    'plugin-vscode-init': '@theia/plugin-ext-vscode/lib/node/plugin-vscode-init',
};
for (const [name, entryPoint] of Object.entries(spawnableCjsModules)) {
    cjsEntryPoints[name] = {
        import: require.resolve(entryPoint),
        library: {
            type: 'commonjs2'
        }
    }
}

/** @type {import('webpack').Configuration['mode']} */
const mode = 'production';

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
    entry: {
        // main entry point of the Theia application backend
        'blueprint': require.resolve('./src-gen/backend/main'),
        // Theia's IPC mechanism:
        'ipc-bootstrap': require.resolve('@theia/core/lib/node/messaging/ipc-bootstrap'),
        // VS Code extension support:
        'plugin-host': require.resolve('@theia/plugin-ext/lib/hosted/node/plugin-host'),
        ...cjsEntryPoints,
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'bundled')
    },
    externals: {
        child_process: 'commonjs2 child_process'
    },
    module: {
        parser: {
            javascript: {
                commonjsMagicComments: true
            }
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
        new webpack.NormalModuleReplacementPlugin(/^bindings$/, path.resolve('bindings.js')),
        // Webpack trips on the places where those modules are required.
        // Since we'll never reach the code paths where they actually are required at runtime,
        // it is safe to completely ignore them.
        // Requiring those at runtime will lead to a `Module not found` error as a result.
        new webpack.IgnorePlugin({
            checkResource: (resource) => [
                'node-ssh',
                'vertx'
            ].includes(resource)
        }),
        new CopyPlugin({
            patterns: [
                // copy the root package.json file over for ApplicationPackage to work
                path.resolve('package.json'),
                {
                    // copy over ripgrep's binaries
                    context: path.resolve(require.resolve('vscode-ripgrep/package.json'), '../bin'),
                    from: '*',
                    to: 'bin'
                },
            ]
        })
    ],
    optimization: {
        // split and reuse code across the various entry points
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
};
