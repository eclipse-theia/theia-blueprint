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

import { AbstractViewContribution, FrontendApplication, FrontendApplicationContribution } from '@theia/core/lib/browser';
import { inject, injectable } from 'inversify';

import { FrontendApplicationStateService } from '@theia/core/lib/browser/frontend-application-state';
import { GettingStartedWidget } from '@theia/getting-started/lib/browser/getting-started-widget';
import { TheiaBlueprintGettingStartedWidget } from './theia-blueprint-getting-started-widget';

@injectable()
export class TheiaBlueprintGettingStartedContribution extends AbstractViewContribution<TheiaBlueprintGettingStartedWidget> implements FrontendApplicationContribution {

    @inject(FrontendApplicationStateService)
    protected readonly stateService: FrontendApplicationStateService;

    constructor() {
        super({
            widgetId: GettingStartedWidget.ID,
            widgetName: GettingStartedWidget.LABEL,
            defaultWidgetOptions: {
                area: 'main',
            }
        });
    }

    async onStart(app: FrontendApplication): Promise<void> {
        this.stateService.reachedState('ready').then(
            () => this.openView({ reveal: true })
        );
    }
}
