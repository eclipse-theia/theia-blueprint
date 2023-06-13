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
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

const argv = yargs(hideBin(process.argv))
    .option('executable', { alias: 'e', type: 'string', default: 'TheiaBlueprint.AppImage', description: 'The executable for which the checksum needs to be updated' })
    .option('yaml', { alias: 'y', type: 'string', default: 'latest-linux.yml', description: 'The yaml file where the checksum needs to be updated' })
    .option('platform', { alias: 'p', type: 'string', default: 'linux', description: 'The OS platform' })
    .version(false)
    .wrap(120)
    .parseSync();

execute();

async function execute(): Promise<void> {
    const executable = argv.executable;
    const yaml = argv.yaml;
    const platform = argv.platform;

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

    console.log('Exe: ' + executablePath + '; Yaml: ' + yamlPath + '; Platform: ' + platform);

    const hash = await hashFile(executablePath, 'sha512', 'base64', {});
    const size = fs.statSync(executablePath).size;

    const yamlContents: string = fs.readFileSync(yamlPath, { encoding: 'utf8' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const latestYaml: any = jsyaml.safeLoad(yamlContents);
    latestYaml.sha512 = hash;
    latestYaml.path = updatedPath(latestYaml.path, latestYaml.version, platform);
    for (const file of latestYaml.files) {
        file.sha512 = hash;
        file.size = size;
        file.url = updatedPath(file.url, latestYaml.version, platform);
    }

    // line width -1 to avoid adding >- on long strings like a hash
    const newYamlContents = jsyaml.dump(latestYaml, { lineWidth: -1 });
    fs.writeFileSync(yamlPath, newYamlContents);
}

function hashFile(file: fs.PathLike, algorithm = 'sha512', encoding: BufferEncoding = 'base64', options: string | {
    flags?: string;
    encoding?: BufferEncoding;
    fd?: number;
    mode?: number;
    autoClose?: boolean;
    emitClose?: boolean;
    start?: number;
    end?: number;
    highWaterMark?: number;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash(algorithm);
        hash.on('error', reject).setEncoding(encoding);
        fs.createReadStream(
            file,
            Object.assign({}, options, {
                highWaterMark: 1024 * 1024,
            })
        )
            .on('error', reject)
            .on('end', () => {
                hash.end();
                resolve(hash.read());
            })
            .pipe(
                hash,
                {
                    end: false,
                }
            );
    });
}

function updatedPath(toUpdate: string, version: string, platform: string): string {
    const extensionIndex = toUpdate.lastIndexOf('.');
    return '../../' + version + '/' + platform + '/' + toUpdate.substring(0, extensionIndex) + '-' + version + toUpdate.substring(extensionIndex);
}
