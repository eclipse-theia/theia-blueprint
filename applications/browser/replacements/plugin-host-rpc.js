/********************************************************************************
 * Copyright (C) 2021 Ericsson and others.
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

const { PluginHostRPC: OriginalPluginHostRPC } = require('@theia/plugin-ext/lib/hosted/node/plugin-host-rpc');
const { dynamicRequire } = require('@theia/core/lib/node/dynamic-require');
const { PluginManagerExtImpl } = require('@theia/plugin-ext/lib/plugin/plugin-manager');
const { loadManifest } = require('@theia/plugin-ext/lib/hosted/node/plugin-manifest-loader');

exports.PluginHostRPC = class extends OriginalPluginHostRPC {
    createPluginManager(envExt, terminalService, storageProxy, preferencesManager, webview, secretsExt, rpc) {
        const { extensionTestsPath } = process.env;
        /** @type {import('@theia/plugin-ext/lib/plugin/plugin-manager').PluginHost} */
        const pluginHost = {
            loadPlugin: plugin => {
                console.log('PLUGIN_HOST(' + process.pid + '): PluginManagerExtImpl/loadPlugin(' + plugin.pluginPath + ')');
                // cleaning the cache for all files of that plug-in.
                for (const [key, mod] of Object.entries(require.cache)) {
                    // attempting to reload a native module will throw an error, so skip them
                    if (typeof mod.id === 'string' && mod.id.endsWith('.node')) {
                        return;
                    }
                    // remove children that are part of the plug-in
                    if (Array.isArray(mod.children)) {
                        let i = mod.children.length;
                        while (i--) {
                            const childMod = mod.children[i];
                            // ensure the child module is not null, is in the plug-in folder, and is not a native module (see above)
                            if (childMod && typeof childMod.id === 'string' && childMod.id.startsWith(plugin.pluginFolder) && !childMod.id.endsWith('.node')) {
                                // cleanup exports - note that some modules (e.g. ansi-styles) define their
                                // exports in an immutable manner, so overwriting the exports throws an error
                                delete childMod.exports;
                                mod.children.splice(i, 1);
                                for (let j = 0; j < childMod.children.length; j++) {
                                    delete childMod.children[j];
                                }
                            }
                        }
                    }
                    if (mod.parent && key.startsWith(plugin.pluginFolder)) {
                        // delete entry
                        delete __webpack_require__.c[key];
                        const ix = mod.parent.children.indexOf(mod);
                        if (ix >= 0) {
                            mod.parent.children.splice(ix, 1);
                        }
                    }
                }
                if (plugin.pluginPath) {
                    return dynamicRequire(plugin.pluginPath);
                }
            },
            init: async raw => {
                console.log('PLUGIN_HOST(' + process.pid + '): PluginManagerExtImpl/init()');
                const result = [];
                const foreign = [];
                for (const plg of raw) {
                    try {
                        const pluginModel = plg.model;
                        const pluginLifecycle = plg.lifecycle;
                        const rawModel = await loadManifest(pluginModel.packagePath);
                        rawModel.packagePath = pluginModel.packagePath;
                        if (pluginModel.entryPoint.frontend) {
                            foreign.push({
                                pluginPath: pluginModel.entryPoint.frontend,
                                pluginFolder: pluginModel.packagePath,
                                pluginUri: pluginModel.packageUri,
                                model: pluginModel,
                                lifecycle: pluginLifecycle,
                                rawModel
                            });
                        }
                        else {
                            let backendInitPath = pluginLifecycle.backendInitPath;
                            // if no init path, try to init as regular Theia plugin
                            if (!backendInitPath) {
                                backendInitPath = __dirname + '/scanners/backend-init-theia.js';
                            }
                            const plugin = {
                                pluginPath: pluginModel.entryPoint.backend,
                                pluginFolder: pluginModel.packagePath,
                                pluginUri: pluginModel.packageUri,
                                model: pluginModel,
                                lifecycle: pluginLifecycle,
                                rawModel
                            };
                            this.initContext(backendInitPath, plugin);
                            result.push(plugin);
                        }
                    }
                    catch (e) {
                        console.error(`Failed to initialize ${plg.model.id} plugin.`, e);
                    }
                }
                return [result, foreign];
            },
            initExtApi: extApi => {
                for (const api of extApi) {
                    if (api.backendInitPath) {
                        try {
                            const extApiInit = dynamicRequire(api.backendInitPath);
                            extApiInit.provideApi(rpc, pluginManager);
                        }
                        catch (e) {
                            console.error(e);
                        }
                    }
                }
            },
        };
        if (extensionTestsPath) {
            pluginHost.loadTests = async () => {
                /* eslint-disable @typescript-eslint/no-explicit-any */
                // Require the test runner via node require from the provided path
                let testRunner;
                let requireError;
                try {
                    testRunner = dynamicRequire(extensionTestsPath);
                }
                catch (error) {
                    requireError = error;
                }
                // Execute the runner if it follows our spec
                if (testRunner && typeof testRunner.run === 'function') {
                    return new Promise((resolve, reject) => {
                        testRunner.run(extensionTestsPath, (error) => {
                            if (error) {
                                reject(error.toString());
                            }
                            else {
                                resolve(undefined);
                            }
                        });
                    });
                }
                throw new Error(requireError ?
                    requireError.toString() :
                    `Path ${extensionTestsPath} does not point to a valid extension test runner.`);
            };
        }
        return new PluginManagerExtImpl(
            pluginHost,
            envExt,
            terminalService,
            storageProxy,
            secretsExt,
            preferencesManager,
            webview,
            rpc
        );
    }
}
