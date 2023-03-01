/********************************************************************************
 * Copyright (C) 2022 EclipseSource and others.
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

import { inject, injectable } from '@theia/core/shared/inversify';
import { BackendApplicationContribution } from '@theia/core/lib/node/backend-application';
import { Application, Router, Request, Response } from '@theia/core/shared/express';
import { json } from 'body-parser';
import { ILogger } from '@theia/core/lib/common';
import { EnvVariablesServer } from '@theia/core/lib/common/env-variables';
import * as sudo from '@vscode/sudo-prompt';
import * as fs from 'fs-extra';
import URI from '@theia/core/lib/common/uri';

interface PathEntry {
    source: string;
    target: string;
}

@injectable()
export class TheiaLauncherServiceEndpoint implements BackendApplicationContribution {
    protected static PATH = '/launcher';
    private LAUNCHER_LINK_SOURCE = '/usr/local/bin/theia';

    @inject(ILogger)
    protected readonly logger: ILogger;

    @inject(EnvVariablesServer)
    protected readonly envServer: EnvVariablesServer;

    configure(app: Application): void {
        const router = Router();
        router.put('/', (request, response) => this.createLauncher(request, response));
        router.get('/initialized', (request, response) => this.isInitialized(request, response));
        app.use(json());
        app.use(TheiaLauncherServiceEndpoint.PATH, router);
    }

    private async isInitialized(_request: Request, response: Response): Promise<void> {
        if (!process.env.APPIMAGE) {
            // we are not running from an AppImage, so there's nothing to initialize
            //return true
            response.json({ initialized: true });
        }
        const storageFile = await this.getStorageFilePath();
        if (!storageFile) {
            throw new Error(`Could not resolve path to storage file.`);
        }
        if (!fs.existsSync(storageFile)) {
            response.json({ initialized: false });
            return;
        }
        const data = await this.readLauncherPathsFromStorage(storageFile);
        const initialized = !!data.find(entry => entry.source === this.LAUNCHER_LINK_SOURCE);
        response.json({ initialized });
    }

    private async getStorageFilePath(): Promise<string> {
        const configDirUri = await this.envServer.getConfigDirUri();
        const globalStorageFolderUri = new URI(configDirUri).resolve('globalStorage/blueprint-launcher/paths.json');
        const globalStorageFolderFsPath = globalStorageFolderUri.path.fsPath();
        return globalStorageFolderFsPath;
    }

    private async readLauncherPathsFromStorage(storageFile: string): Promise<PathEntry[]> {
        if (!fs.existsSync(storageFile)) {
            return [];
        }
        try {
            return await fs.readJSON(storageFile);
        } catch (error) {
            console.error('Failed to parse data from "', storageFile, '". Reason:', error);
            return [];
        }
    }

    private async getLogFilePath(): Promise<string> {
        const configDirUri = await this.envServer.getConfigDirUri();
        const logFileUri = new URI(configDirUri).resolve('logs/launcher.log');
        return logFileUri.path.fsPath();
    }

    private async createLauncher(request: Request, response: Response): Promise<void> {
        const shouldCreateLauncher = request.body.create;
        const launcher = this.LAUNCHER_LINK_SOURCE;
        const target = process.env.APPIMAGE;
        const logFile = await this.getLogFilePath();
        const command = `printf '%s\n' '#!/bin/bash' 'exec "${target}" \\$1 &> ${logFile} &' >${launcher} && chmod +x ${launcher}`;
        if (shouldCreateLauncher) {
            const targetExists = target && fs.existsSync(target);
            if (!targetExists) {
                throw new Error('Could not find application to launch');
            }
            sudo.exec(command, { name: 'Theia Blueprint' });
        }

        const storageFile = await this.getStorageFilePath();
        const data = fs.existsSync(storageFile) ? await this.readLauncherPathsFromStorage(storageFile) : [];
        fs.outputJSONSync(storageFile, [...data, { source: launcher, target: shouldCreateLauncher ? target : null }]);

        response.sendStatus(200);
    }
}