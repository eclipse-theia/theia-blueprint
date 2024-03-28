/********************************************************************************
 * Copyright (C) 2021 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 *
 * SPDX-License-Identifier: MIT
 ********************************************************************************/
import * as fs from 'fs';
import * as path from 'path';
import { PackageJson } from 'type-fest';

execute();

async function execute(): Promise<void> {
    const theiaVersion = process.argv[2];
    const packageJsonPath = path.resolve(
        './',
        'package.json'
    );

    console.log(`Updating ${packageJsonPath}...`);

    const packageJsonContents: string = fs.readFileSync(packageJsonPath, { encoding: 'utf8' });
    const packageJson: PackageJson = JSON.parse(packageJsonContents);

    console.log('...dependencies...');
    if (packageJson.dependencies) {
        updateTheiaVersions(packageJson.dependencies, theiaVersion);
    }
    console.log('...done...');

    console.log('...devDependencies...');
    if (packageJson.devDependencies) {
        updateTheiaVersions(packageJson.devDependencies, theiaVersion);
    }
    console.log('...done.');

    // note: "null" is valid as per `stringify()` signature
    // eslint-disable-next-line no-null/no-null
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

function updateTheiaVersions(dependencies: PackageJson.Dependency, theiaVersion: string): void {
    for (const dependency in dependencies) {
        if (dependency.startsWith('@theia/')) {
            console.log(`...setting ${dependency} from ${dependencies[dependency]} to next...`);
            dependencies[dependency] = theiaVersion;
        }
    }
}
