/********************************************************************************
 * Copyright (C) 2023 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 *
 * SPDX-License-Identifier: MIT
 ********************************************************************************/
import * as fs from 'fs';
import * as path from 'path';

execute();

async function execute(): Promise<void> {
    const packageJsonPath = path.resolve(
        './',
        'package.json'
    );

    console.log(`Updating ${packageJsonPath}...`);

    const packageJsonContents: string = fs.readFileSync(packageJsonPath, { encoding: 'utf8' });
    const packageJson = JSON.parse(packageJsonContents);

    console.log('...application name...');
    packageJson.theia.frontend.config.applicationName = 'Theia IDE Preview';
    console.log('...done...');

    console.log('...version...');
    // in order to work well with electron updater we keep a constant prerelease tag (-preview) and keep on increasing the patch segment
    const curVersion: string = packageJson.version;
    packageJson.version = curVersion.substring(0, curVersion.lastIndexOf('.') + 1) + new Date().valueOf() + '-preview';
    console.log('...done...');

    // note: "null" is valid as per `stringify()` signature
    // eslint-disable-next-line no-null/no-null
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}
