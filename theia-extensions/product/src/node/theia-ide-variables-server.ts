/********************************************************************************
 * Copyright (C) 2021 Ericsson and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 *
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import * as os from 'os';
import * as path from 'path';
import { injectable } from '@theia/core/shared/inversify';
import { FileUri } from '@theia/core/lib/common/file-uri';
import { EnvVariablesServerImpl } from '@theia/core/lib/node/env-variables';

@injectable()
export class TheiaIDEEnvVariableServer extends EnvVariablesServerImpl {

    protected readonly _configDirUri: string = FileUri.create(path.join(os.homedir(), '.theia-ide')).toString(true);

    async getConfigDirUri(): Promise<string> {
        return this._configDirUri;
    }

}

