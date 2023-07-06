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

import * as os from 'os';
import * as path from 'path';
import { existsSync, mkdirSync } from 'node:fs';
import { injectable } from '@theia/core/shared/inversify';
import { FileUri } from '@theia/core/lib/node/file-uri';
import { EnvVariablesServerImpl } from '@theia/core/lib/node/env-variables';

@injectable()
export class TheiaBlueprintEnvVariableServer extends EnvVariablesServerImpl {

    protected readonly _configDirUri: Promise<string> = this.createConfigDirUri();

    protected async createConfigDirUri(): Promise<string> {
        const dataFolderPath = path.join(process.cwd(), 'data');
        const userDataPath = path.join(dataFolderPath, 'user-data');
        // Check if data folder exists for portable mode
        if (existsSync(dataFolderPath)) {
            if (existsSync(userDataPath)) {
                return FileUri.create(userDataPath).toString(true);
            } else {
                mkdirSync(userDataPath);
                return FileUri.create(userDataPath).toString(true);
            }
        } else {
            return FileUri.create(path.join(os.homedir(), '.theia-blueprint')).toString(true);
        }
    }

    async getConfigDirUri(): Promise<string> {
        return this._configDirUri;
    }

}

