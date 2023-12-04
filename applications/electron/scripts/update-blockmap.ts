/********************************************************************************
 * Copyright (C) 2023 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 *
 * SPDX-License-Identifier: MIT
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
