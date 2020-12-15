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
import * as React from 'react';

import { AboutDialog, AboutDialogProps } from "@theia/core/lib/browser/about-dialog";
import { injectable, inject } from 'inversify';

@injectable()
export class TheiaInstallerAboutDialog extends AboutDialog {

    constructor(
        @inject(AboutDialogProps) protected readonly props: AboutDialogProps
    ) {
        super(props);
    }

    protected renderHeader(): React.ReactNode {
        const applicationInfo = this.applicationInfo;
        return applicationInfo && <h3>{applicationInfo.name} {applicationInfo.version} (Alpha)</h3>;
    }
}