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

import { BackendApplicationCliContribution, BackendApplicationServer } from '@theia/core/lib/node';
import { RgPath } from '@theia/search-in-workspace/lib/node/ripgrep-search-in-workspace-server';
import { PluginDeployerParticipant, PluginDeployerStartContext } from '@theia/plugin-ext';
import { ContainerModule, injectable } from 'inversify';
import { installationPath, getAppResourcePath } from './theia-blueprint-application';
import express = require('express');

const RgName = process.platform === 'win32'
    ? 'rg.exe'
    : 'rg';

export default new ContainerModule((bind, unbind, isBound, rebind) => {
    bind(PluginDeployerParticipant).to(BlueprintBuiltinPlugins).inSingletonScope();
    bind(BackendApplicationServer).to(BlueprintApplicationServer).inSingletonScope();
    rebind(BackendApplicationCliContribution).to(BlueprintBackendApplicationCliContribution).inSingletonScope();
    rebind(RgPath).toConstantValue(getAppResourcePath(`bin/${RgName}`));
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
class BlueprintBackendApplicationCliContribution extends BackendApplicationCliContribution {
    protected appProjectPath(): string {
        return installationPath;
    }
}
