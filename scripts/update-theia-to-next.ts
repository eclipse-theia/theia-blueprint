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
import { PackageJson } from 'type-fest';

execute();

async function execute(): Promise<void> {
    const packageJsonPath = path.resolve(
        './',
        'package.json'
    );

    console.log(`Updating ${packageJsonPath}...`);

    const packageJsonContents: string = fs.readFileSync(packageJsonPath, { encoding: 'utf8' });
    const packageJson: PackageJson = JSON.parse(packageJsonContents);

    console.log('...dependencies...');
    if (packageJson.dependencies) {
        updateTheiaVersions(packageJson.dependencies);
    }
    console.log('...done...');

    console.log('...devDependencies...');
    if (packageJson.devDependencies) {
        updateTheiaVersions(packageJson.devDependencies);
    }
    console.log('...done.');

    // note: "null" is valid as per `stringify()` signature
    // eslint-disable-next-line no-null/no-null
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

function updateTheiaVersions(dependencies: PackageJson.Dependency): void {
    for (const dependency in dependencies) {
        if (dependency.startsWith('@theia/')) {
            console.log(`...setting ${dependency} from ${dependencies[dependency]} to next...`);
            dependencies[dependency] = 'next';
        }
    }
}
