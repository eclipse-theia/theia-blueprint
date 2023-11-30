/********************************************************************************
 * Copyright (C) 2021 Ericsson and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 *
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import { ContainerModule } from '@theia/core/shared/inversify';
import { EnvVariablesServer } from '@theia/core/lib/common/env-variables';
import { TheiaIDEEnvVariableServer } from './theia-ide-variables-server';

export default new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(EnvVariablesServer).to(TheiaIDEEnvVariableServer).inSingletonScope();
});
