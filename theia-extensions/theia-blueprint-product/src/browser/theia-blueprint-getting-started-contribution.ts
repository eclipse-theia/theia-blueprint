/********************************************************************************
 * Copyright (C) 2020 EclipseSource and others.
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

import { inject, injectable } from 'inversify';

import { FrontendApplication } from '@theia/core/lib/browser';
import { FrontendApplicationStateService } from '@theia/core/lib/browser/frontend-application-state';
import { GettingStartedContribution } from '@theia/getting-started/lib/browser/getting-started-contribution';
import { WorkspaceService } from '@theia/workspace/lib/browser';

@injectable()
export class TheiaBlueprintGettingStartedContribution extends GettingStartedContribution {

    @inject(FrontendApplicationStateService)
    protected readonly stateService: FrontendApplicationStateService;

    @inject(WorkspaceService)
    protected readonly workspaceService: WorkspaceService;

    constructor() {
        super();
    }

    async onStart(app: FrontendApplication): Promise<void> {
        this.stateService.reachedState('ready').then(
            () => this.openView({ reveal: true })
        );
    }
}
