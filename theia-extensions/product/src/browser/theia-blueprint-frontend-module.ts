/********************************************************************************
 * Copyright (C) 2020 TypeFox, EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 *
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import '../../src/browser/style/index.css';

import { WidgetFactory } from '@theia/core/lib/browser';
import { AboutDialog } from '@theia/core/lib/browser/about-dialog';
import { CommandContribution } from '@theia/core/lib/common/command';
import { ContainerModule } from '@theia/core/shared/inversify';
import { GettingStartedWidget } from '@theia/getting-started/lib/browser/getting-started-widget';
import { MenuContribution } from '@theia/core/lib/common/menu';
import { TheiaBlueprintAboutDialog } from './theia-blueprint-about-dialog';
import { TheiaBlueprintContribution } from './theia-blueprint-contribution';
import { TheiaBlueprintGettingStartedWidget } from './theia-blueprint-getting-started-widget';

export default new ContainerModule((bind, _unbind, isBound, rebind) => {
    bind(TheiaBlueprintGettingStartedWidget).toSelf();
    bind(WidgetFactory).toDynamicValue(context => ({
        id: GettingStartedWidget.ID,
        createWidget: () => context.container.get<TheiaBlueprintGettingStartedWidget>(TheiaBlueprintGettingStartedWidget),
    })).inSingletonScope();
    if (isBound(AboutDialog)) {
        rebind(AboutDialog).to(TheiaBlueprintAboutDialog).inSingletonScope();
    } else {
        bind(AboutDialog).to(TheiaBlueprintAboutDialog).inSingletonScope();
    }

    bind(TheiaBlueprintContribution).toSelf().inSingletonScope();
    [CommandContribution, MenuContribution].forEach(serviceIdentifier =>
        bind(serviceIdentifier).toService(TheiaBlueprintContribution)
    );
});
