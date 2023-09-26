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
// eslint-disable-next-line import/no-extraneous-dependencies
import * as jsyaml from 'js-yaml';

execute();

async function execute(): Promise<void> {
    const electronBuilderYamlPath = path.resolve(
        './',
        'electron-builder.yml'
    );

    console.log(`Updating ${electronBuilderYamlPath}...`);

    const electronBuilderYamlContents: string = fs.readFileSync(electronBuilderYamlPath, { encoding: 'utf8' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const electronBuilderYaml: any = jsyaml.load(electronBuilderYamlContents);

    console.log('...appId...');
    electronBuilderYaml.appId = 'eclipse.theia.preview';
    console.log('...done...');

    console.log('...productName...');
    electronBuilderYaml.productName = 'TheiaIDEPreview';
    console.log('...done...');

    console.log('...publish urls...');
    electronBuilderYaml.win.publish.url = 'https://download.eclipse.org/theia/next/windows';
    electronBuilderYaml.mac.publish.url = 'https://download.eclipse.org/theia/next/macos';
    electronBuilderYaml.linux.publish.url = 'https://download.eclipse.org/theia/next/linux';
    console.log('...done...');

    // line width -1 to avoid adding >- on long strings like a hash
    const newYamlContents = jsyaml.dump(electronBuilderYaml, { lineWidth: -1 });
    fs.writeFileSync(electronBuilderYamlPath, newYamlContents);
}
