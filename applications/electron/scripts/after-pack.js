#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const util = require('util');
const child_process = require('child_process');
const rimraf = require('rimraf');
const sign_util = require('app-builder-lib/electron-osx-sign/util');
const asynfRimraf = util.promisify(rimraf);

const DELETE_PATHS = [
    'Contents/Resources/app/node_modules/unzip-stream/aa.zip',
    'Contents/Resources/app/node_modules/unzip-stream/testData*'
];

const signCommand = path.join(__dirname, 'sign.sh');
const notarizeCommand = path.join(__dirname, 'notarize.sh');
const entitlements = path.resolve(__dirname, '..', 'entitlements.plist');

const signFile = file => {
    const stat = fs.lstatSync(file);
    const mode = stat.isFile() ? stat.mode : undefined;

    console.log(`Signing ${file}...`);
    child_process.execFileSync(signCommand, [
        path.basename(file),
        entitlements
    ], {
        cwd: path.dirname(file),
        maxBuffer: 1024 * 10000
    });

    if (mode) {
        console.log(`Setting attributes of ${file}...`);
        fs.chmodSync(file, mode);
    }
};

exports.default = async function(context) {
    const running_ci = process.env.BLUEPRINT_JENKINS_CI == 'true';
    const running_on_mac = context.packager.platform.name == 'mac';
    const appPath = path.resolve(context.appOutDir, `${context.packager.appInfo.productFilename}.app`);

    // Remove anything we don't want in the final package
    for (const deletePath of DELETE_PATHS) {
        const resolvedPath = path.resolve(appPath, deletePath);
        console.log(`Deleting ${resolvedPath}...`);
        await asynfRimraf(resolvedPath);
    }

    // Only continue for macOS during CI
    if (running_ci && running_on_mac) {
        console.log("Detected Blueprint Jenkins CI on Mac - proceed with signing");
    } else {
        if (running_on_mac) {
            console.log("Skip Mac CI signing");
        }
        return
    }

    // Use app-builder-lib to find all binaries to sign, at this level it will include the final .app
    let childPaths = await sign_util.walkAsync(context.appOutDir);

    // Sign deepest first
    // From https://github.com/electron-userland/electron-builder/blob/master/packages/app-builder-lib/electron-osx-sign/sign.js#L120
    childPaths = childPaths.sort((a, b) => {
        const aDepth = a.split(path.sep).length;
        const bDepth = b.split(path.sep).length;
        return bDepth - aDepth;
    });

    // Sign binaries
    childPaths.forEach(file => signFile(file, context.appOutDir));

    // Notarize app
    child_process.execFileSync(notarizeCommand, [
        path.basename(appPath),
        context.packager.appInfo.info._configuration.appId
    ], {
        cwd: path.dirname(appPath),
        maxBuffer: 1024 * 10000
    });
}
