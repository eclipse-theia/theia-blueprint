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

import { ConfirmDialog, Dialog, FrontendApplication, FrontendApplicationContribution, StorageService } from '@theia/core/lib/browser';
import { ILogger, MaybePromise } from '@theia/core/lib/common';
import { nls } from '@theia/core/lib/common/nls';
import { inject, injectable } from '@theia/core/shared/inversify';
import { LauncherService } from './launcher-service';

@injectable()
export class CreateLauncherCommandContribution implements FrontendApplicationContribution {

    @inject(StorageService)
    protected readonly storageService: StorageService;

    @inject(ILogger)
    protected readonly logger: ILogger;

    @inject(LauncherService) private readonly launcherService: LauncherService;

    onStart(app: FrontendApplication): MaybePromise<void> {
        this.launcherService.isInitialized().then(async initialized => {
            if (!initialized) {
                const messageContainer = document.createElement('div');
                // eslint-disable-next-line max-len
                messageContainer.textContent = nls.localizeByDefault("Would you like to install a shell command that launches the application?\nYou will be able to run Theia Blueprint from the command line by typing 'theia'.");
                messageContainer.setAttribute('style', 'white-space: pre-line');
                const details = document.createElement('p');
                details.textContent = 'Administrator privileges are required, you will need to enter your password next.';
                messageContainer.appendChild(details);
                const dialog = new ConfirmDialog({
                    title: nls.localizeByDefault('Create launcher'),
                    msg: messageContainer,
                    ok: Dialog.YES,
                    cancel: Dialog.NO
                });
                const install = await dialog.open();
                this.launcherService.createLauncher(!!install);
                this.logger.info('Initialized application launcher.');
            } else {
                this.logger.info('Application launcher was already initialized.');
            }
        });
    }
}
