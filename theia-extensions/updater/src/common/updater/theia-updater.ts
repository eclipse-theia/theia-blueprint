/********************************************************************************
 * Copyright (C) 2020 TypeFox, EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 *
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import { JsonRpcServer } from '@theia/core/lib/common/messaging/proxy-factory';

export const TheiaUpdaterPath = '/services/theia-updater';
export const TheiaUpdater = Symbol('TheiaUpdater');
export interface TheiaUpdater extends JsonRpcServer<TheiaUpdaterClient> {
    checkForUpdates(): void;
    downloadUpdate(): void;
    onRestartToUpdateRequested(): void;
    disconnectClient(client: TheiaUpdaterClient): void;
}

export const TheiaUpdaterClient = Symbol('TheiaUpdaterClient');

export interface UpdaterError {
    message: string;
    errorLogPath?: string;
}

export interface TheiaUpdaterClient {
    updateAvailable(available: boolean, startupCheck: boolean): void;
    notifyReadyToInstall(): void;
    reportError(error: UpdaterError): void;
}
