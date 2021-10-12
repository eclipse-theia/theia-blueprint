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

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as jsyaml from 'js-yaml';
import * as path from 'path';
import * as stream from 'stream'
import { promisify } from 'util';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

const pipeline = promisify(stream.pipeline);

const argv = yargs(hideBin(process.argv))
    .option('executable', { alias: 'e', type: 'string', default: 'TheiaBlueprint.AppImage', desription: 'The executable for which the checksum needs to be updated' })
    .option('yaml', { alias: 'y', type: 'string', default: 'latest-linux.yml', desription: 'The yaml file where the checksum needs to be updated' })
    .version(false)
    .wrap(120)
    .parseSync();

execute();

async function execute(): Promise<void> {
    const executable = argv.executable;
    const yaml = argv.yaml;

    const executablePath = path.resolve(
        __dirname,
        '../dist/',
        executable
    );

    const yamlPath = path.resolve(
        __dirname,
        '../dist/',
        yaml
    );

    console.log('Exe: ' + executablePath + '; Yaml: ' + yamlPath)

    const hash = await hashFile(executablePath, 'sha512', 'base64');
    const size = fs.statSync(executablePath).size

    const yamlContents: string = fs.readFileSync(yamlPath, { encoding: 'utf8' })
    const latestYaml: any = jsyaml.safeLoad(yamlContents);
    latestYaml.sha512 = hash;
    latestYaml.path = updatedPath(latestYaml.path, latestYaml.version)
    for (const file of latestYaml.files) {
        file.sha512 = hash;
        file.size = size;
        file.url = updatedPath(file.url, latestYaml.version)
    }

    //line width -1 to avoid adding >- on long strings like a hash
    const newYamlContents = jsyaml.dump(latestYaml, { lineWidth: -1 });
    fs.writeFileSync(yamlPath, newYamlContents);
}

interface HashFileOptions {
    flags?: string
    encoding?: BufferEncoding
    fd?: number
    mode?: number
    autoClose?: boolean
    emitClose?: boolean
    start?: number
    end?: number
    highWaterMark?: number
}
async function hashFile(file: fs.PathLike, algorithm: string, encoding?: undefined, options?: HashFileOptions): Promise<Buffer>
async function hashFile(file: fs.PathLike, algorithm: string, encoding: crypto.BinaryToTextEncoding, options?: HashFileOptions): Promise<string>
async function hashFile(file: fs.PathLike, algorithm = 'sha512', encoding: crypto.BinaryToTextEncoding = 'base64', options: HashFileOptions = {}): Promise<Buffer | string> {
    const hash = crypto.createHash(algorithm);
    await pipeline(
        fs.createReadStream(file, { ...options, highWaterMark: 1024 * 1024 }),
        hash,
    );
    return hash.digest(encoding);
}

function updatedPath(path: string, version: string): string {
    const extensionIndex = path.lastIndexOf('.');
    return path.substring(0, extensionIndex) + '-' + version + path.substring(extensionIndex);
}
