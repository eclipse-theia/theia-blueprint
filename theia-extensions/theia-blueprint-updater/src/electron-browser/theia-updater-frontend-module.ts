/********************************************************************************
 * Copyright (C) 2020 TypeFox, EclipseSource and others.
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

import { CommandContribution, MenuContribution } from '@theia/core/lib/common';
import { ElectronMenuUpdater, TheiaUpdaterClientImpl, TheiaUpdaterFrontendContribution } from './updater/theia-updater-frontend-contribution';
import { TheiaUpdater, TheiaUpdaterClient, TheiaUpdaterPath } from '../common/updater/theia-updater';

import { ContainerModule } from 'inversify';
import { ElectronIpcConnectionProvider } from '@theia/core/lib/electron-browser/messaging/electron-ipc-connection-provider';
import { PreferenceContribution } from '@theia/core/lib/browser';
import { theiaUpdaterPreferenceSchema } from './updater/theia-updater-preferences';

export default new ContainerModule((bind, _unbind, isBound, rebind) => {
    bind(ElectronMenuUpdater).toSelf().inSingletonScope();
    bind(TheiaUpdaterClientImpl).toSelf().inSingletonScope();
    bind(TheiaUpdaterClient).toService(TheiaUpdaterClientImpl);
    bind(TheiaUpdater).toDynamicValue(context => {
        const client = context.container.get(TheiaUpdaterClientImpl);
        return ElectronIpcConnectionProvider.createProxy(context.container, TheiaUpdaterPath, client);
    }).inSingletonScope();
    bind(TheiaUpdaterFrontendContribution).toSelf().inSingletonScope();
    bind(MenuContribution).toService(TheiaUpdaterFrontendContribution);
    bind(CommandContribution).toService(TheiaUpdaterFrontendContribution);

    bind(PreferenceContribution).toConstantValue({ schema: theiaUpdaterPreferenceSchema });
});
