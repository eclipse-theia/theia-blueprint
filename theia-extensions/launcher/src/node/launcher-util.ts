/********************************************************************************
 * Copyright (C) 2024 STMicroelectronics and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 *
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import { EnvVariablesServer } from '@theia/core/lib/common/env-variables';
import URI from '@theia/core/lib/common/uri';

export async function getStorageFilePath(envServer: EnvVariablesServer, fileName: string): Promise<string> {
    const configDirUri = await envServer.getConfigDirUri();
    const globalStorageFolderUri = new URI(configDirUri).resolve('globalStorage/theia-ide-launcher/' + fileName);
    const globalStorageFolderFsPath = globalStorageFolderUri.path.fsPath();
    return globalStorageFolderFsPath;
}
