/********************************************************************************
 * Copyright (C) 2023 EclipseSource and others.
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

import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';
import { executeAppBuilderAsJson } from 'app-builder-lib/out/util/appBuilder';
// eslint-disable-next-line import/no-extraneous-dependencies
import { BlockMapDataHolder } from 'builder-util-runtime';
import { rmSync } from 'fs';
import * as path from 'path';

const BLOCK_MAP_FILE_SUFFIX = '.blockmap';

const argv = yargs(hideBin(process.argv))
    .option('executable', { alias: 'e', type: 'string', default: 'TheiaBlueprint.exe', description: 'The executable for which the blockmap needs to be updated' })
    .version(false)
    .wrap(120)
    .parseSync();

execute();

async function execute(): Promise<void> {
    const executable = argv.executable;
    const executablePath = path.resolve(
        __dirname,
        '../dist/',
        executable
    );
    const blockMapFile = `${executablePath}${BLOCK_MAP_FILE_SUFFIX}`;
    rmSync(blockMapFile, {
        force: true,
    });
    await executeAppBuilderAsJson<BlockMapDataHolder>(['blockmap', '--input', executablePath, '--output', blockMapFile]);
};
