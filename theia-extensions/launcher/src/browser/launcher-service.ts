/********************************************************************************
 * Copyright (C) 2022 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 *
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import { Endpoint } from '@theia/core/lib/browser';
import { injectable } from '@theia/core/shared/inversify';

@injectable()
export class LauncherService {

    async isInitialized(): Promise<boolean> {
        const response = await fetch(new Request(`${this.endpoint()}/initialized`), {
            body: undefined,
            method: 'GET'
        }).then(r => r.json());
        return !!response?.initialized;
    }

    async createLauncher(create: boolean): Promise<void> {
        fetch(new Request(`${this.endpoint()}`), {
            body: JSON.stringify({ create }),
            method: 'PUT',
            headers: new Headers({ 'Content-Type': 'application/json' })
        });
    }

    protected endpoint(): string {
        const url = new Endpoint({ path: 'launcher' }).getRestUrl().toString();
        return url.endsWith('/') ? url.slice(0, -1) : url;
    }
}
