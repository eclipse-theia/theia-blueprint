/********************************************************************************
 * Copyright (C) 2022 Ericsson and others.
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

const assert = require('assert');
const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');

fix();

/**
 * Theia 1.23.0 does not publish its `i18n` folder.
 * This will be fixed in 1.24.0.
 */
async function fix() {
    const corePackageJsonPath = require.resolve('@theia/core/package.json');
    const corePackageJson = JSON.parse(await fs.readFile(corePackageJsonPath, 'utf8'));
    const corePath = path.dirname(corePackageJsonPath);
    if (corePackageJson.version !== '1.23.0') {
        console.warn(`${__filename}: Found @theia/core@${corePackageJson.version}`);
        console.warn(`${__filename}: Running this script might no longer be required!`);
        return;
    }
    // Use GitHub's API to fetch contents of the core/i18n folder for the 1.23.0 tag/release
    const i18nReq = await fetch('https://api.github.com/repos/eclipse-theia/theia/contents/packages/core/i18n?ref=v1.23.0');
    const i18n = await i18nReq.json();
    assert(Array.isArray(i18n));
    await fs.mkdir(path.resolve(corePath, 'i18n'), { recursive: true });
    await Promise.all(i18n.map(async file => {
        if (!file.type === 'file') {
            return;
        }
        const contentReq = await fetch(file.download_url);
        const content = await contentReq.text();
        await fs.writeFile(path.resolve(corePath, 'i18n', file.name), content);
    }));
}
