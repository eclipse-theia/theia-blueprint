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
import * as fs from 'fs';
import * as path from 'path';

execute();

async function execute(): Promise<void> {
    const packageJsonPath = path.resolve(
        './',
        'package.json'
    );

    const packageJsonContents: string = fs.readFileSync(packageJsonPath, { encoding: 'utf8' })
    const withoutBrowserApp = packageJsonContents.replace('applications/*', 'applications/electron');

    fs.writeFileSync(packageJsonPath, withoutBrowserApp);
}
