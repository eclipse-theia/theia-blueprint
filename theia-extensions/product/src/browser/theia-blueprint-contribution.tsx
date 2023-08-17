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

import { inject, injectable } from '@theia/core/shared/inversify';
import { CommonMenus } from '@theia/core/lib/browser/common-frontend-contribution';
import { Command, CommandContribution, CommandRegistry } from '@theia/core/lib/common/command';
import { MenuContribution, MenuModelRegistry, MenuPath } from '@theia/core/lib/common/menu';
import { WindowService } from '@theia/core/lib/browser/window/window-service';

export namespace BlueprintMenus {
    export const BLUEPRINT_HELP: MenuPath = [...CommonMenus.HELP, 'blueprint'];
}
export namespace BlueprintCommands {
    export const CATEGORY = 'Blueprint';
    export const REPORT_ISSUE: Command = {
        id: 'blueprint:report-issue',
        category: CATEGORY,
        label: 'Report Issue'
    };
    export const DOCUMENTATION: Command = {
        id: 'blueprint:documentation',
        category: CATEGORY,
        label: 'Documentation'
    };
}

@injectable()
export class TheiaBlueprintContribution implements CommandContribution, MenuContribution {

    @inject(WindowService)
    protected readonly windowService: WindowService;

    static REPORT_ISSUE_URL = 'https://github.com/eclipse-theia/theia-blueprint/issues/new?assignees=&labels=&template=bug_report.md';
    static DOCUMENTATION_URL = 'https://theia-ide.org/docs/blueprint_documentation';

    registerCommands(commandRegistry: CommandRegistry): void {
        commandRegistry.registerCommand(BlueprintCommands.REPORT_ISSUE, {
            execute: () => this.windowService.openNewWindow(TheiaBlueprintContribution.REPORT_ISSUE_URL, { external: true })
        });
        commandRegistry.registerCommand(BlueprintCommands.DOCUMENTATION, {
            execute: () => this.windowService.openNewWindow(TheiaBlueprintContribution.DOCUMENTATION_URL, { external: true })
        });
    }

    registerMenus(menus: MenuModelRegistry): void {
        menus.registerMenuAction(BlueprintMenus.BLUEPRINT_HELP, {
            commandId: BlueprintCommands.REPORT_ISSUE.id,
            label: BlueprintCommands.REPORT_ISSUE.label,
            order: '1'
        });
        menus.registerMenuAction(BlueprintMenus.BLUEPRINT_HELP, {
            commandId: BlueprintCommands.DOCUMENTATION.id,
            label: BlueprintCommands.DOCUMENTATION.label,
            order: '2'
        });
    }
}
