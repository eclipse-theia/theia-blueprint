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

import { BackendApplicationCliContribution, BackendApplicationServer } from '@theia/core/lib/node';
import { ApplicationPackage, ExtensionPackage } from '@theia/core/shared/@theia/application-package';
import { ContainerModule, injectable } from '@theia/core/shared/inversify';
import { PluginDeployerParticipant, PluginDeployerStartContext } from '@theia/plugin-ext';
import { RgPath } from '@theia/search-in-workspace/lib/node/ripgrep-search-in-workspace-server';
import { rgPath } from './theia-blueprint-ripgrep';
import { getAppResourcePath, installationPath } from './theia-blueprint-application';
import rawExtensionPackages = require('./webpack-extension-packages');
import express = require('express');
import path = require('path');

export default new ContainerModule((bind, unbind, isBound, rebind) => {
    bind(PluginDeployerParticipant).to(BlueprintBuiltinPlugins).inSingletonScope();
    bind(BackendApplicationServer).to(BlueprintApplicationServer).inSingletonScope();
    rebind(ApplicationPackage).toConstantValue(new BlueprintApplicationPackage({ projectPath: installationPath }));
    rebind(BackendApplicationCliContribution).to(BlueprintBackendApplicationCliContribution).inSingletonScope();
    rebind(RgPath).toConstantValue(rgPath);
});

@injectable()
class BlueprintBuiltinPlugins implements PluginDeployerParticipant {
    async onWillStart(context: PluginDeployerStartContext): Promise<void> {
        context.systemEntries.push(`local-dir:${getAppResourcePath('builtins')}`);
    }
}

@injectable()
class BlueprintApplicationServer implements BackendApplicationServer {
    configure(app: express.Application): void {
        app.use(express.static(getAppResourcePath('lib')));
    }
}

@injectable()
export class BlueprintApplicationPackage extends ApplicationPackage {
    protected _applicationPackages: ExtensionPackage[] = rawExtensionPackages.map(
        raw => new ExtensionPackage(raw, this.registry)
    );
    get packagePath(): string {
        return path.join(__dirname, '../package.json');
    }
    get extensionPackages(): ExtensionPackage[] {
        return this._applicationPackages;
    }
}

@injectable()
class BlueprintBackendApplicationCliContribution extends BackendApplicationCliContribution {
    protected appProjectPath(): string {
        return installationPath;
    }
}
