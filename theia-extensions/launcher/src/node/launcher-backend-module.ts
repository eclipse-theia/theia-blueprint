/********************************************************************************
 * Copyright (C) 2022 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 *
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import { ContainerModule } from '@theia/core/shared/inversify';
import { TheiaLauncherServiceEndpoint } from './launcher-endpoint';
import { BackendApplicationContribution } from '@theia/core/lib/node/backend-application';

export default new ContainerModule(bind => {
    bind(TheiaLauncherServiceEndpoint).toSelf().inSingletonScope();
    bind(BackendApplicationContribution).toService(TheiaLauncherServiceEndpoint);
});
