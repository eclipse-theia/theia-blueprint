/********************************************************************************
 * Copyright (C) 2021 EclipseSource and others.
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

import { ElectronMainApplication, ElectronMainApplicationContribution } from '@theia/core/lib/electron-main/electron-main-application';

import { injectable } from '@theia/core/shared/inversify';
import * as path from 'path';
import * as os from 'os';

@injectable()
export class IconContribution implements ElectronMainApplicationContribution {

    onStart(application: ElectronMainApplication): void {
        if (application.config.electron.windowOptions) {
            const options = application.config.electron.windowOptions;
            if (options.icon === undefined) {
                // window image is undefined. If the executable has an image set, this is used as a fallback
                // Since AppImage does not support this anymore via electron-builder, set an image for the linux platform
                if (os.platform() === 'linux') {
                    options.icon = path.join(__dirname, '../../icons/512-512.png');
                }
            }
        }
    }
}
