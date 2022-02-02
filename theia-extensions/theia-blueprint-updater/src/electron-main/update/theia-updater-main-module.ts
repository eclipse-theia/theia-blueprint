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

import { TheiaUpdater, TheiaUpdaterClient, TheiaUpdaterPath } from '../../common/updater/theia-updater';
import { ContainerModule } from '@theia/core/shared/inversify';
import { ElectronConnectionHandler } from '@theia/core/lib/electron-common/messaging/electron-connection-handler';
import { ElectronMainApplicationContribution } from '@theia/core/lib/electron-main/electron-main-application';
import { JsonRpcConnectionHandler } from '@theia/core/lib/common/messaging/proxy-factory';
import { TheiaUpdaterImpl } from './theia-updater-impl';

export default new ContainerModule(bind => {
    bind(TheiaUpdaterImpl).toSelf().inSingletonScope();
    bind(TheiaUpdater).toService(TheiaUpdaterImpl);
    bind(ElectronMainApplicationContribution).toService(TheiaUpdater);
    bind(ElectronConnectionHandler).toDynamicValue(context =>
        new JsonRpcConnectionHandler<TheiaUpdaterClient>(TheiaUpdaterPath, client => {
            const server = context.container.get<TheiaUpdater>(TheiaUpdater);
            server.setClient(client);
            client.onDidCloseConnection(() => server.disconnectClient(client));
            return server;
        })
    ).inSingletonScope();
});
