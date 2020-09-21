const path = require('path');
const util = require('util');
const child_process = require('child_process');
const rimraf = require('rimraf');
const sign_util = require('app-builder-lib/electron-osx-sign/util');

const asynfRimraf = util.promisify(rimraf);

const DELETE_PATHS = [
    'Contents/Resources/app/node_modules/unzip-stream/testData*'
];

const signCommand = path.join(__dirname, 'sign.sh');
const entitlements = path.resolve(__dirname, '..', 'entitlements.plist');

const signFile = (file, cwd) => {
    console.log(`Signing ${file}...`);

    child_process.execFileSync(signCommand, [
        file,
        entitlements
    ], {
        cwd
    });
};

exports.default = async function (context) {
    const appName = `${context.packager.appInfo.productFilename}.app`;
    const appPath = path.resolve(context.appOutDir, appName);

    // Remove anything we don't want in the final package
    for (const deletePath of DELETE_PATHS) {
        await asynfRimraf(path.resolve(appPath, deletePath));
    }

    // Only continue for macOS
    if (context.packager.platform.name !== 'mac') {
        return;
    }

    let childPaths = await sign_util.walkAsync(appPath);

    // From https://github.com/electron-userland/electron-builder/blob/master/packages/app-builder-lib/electron-osx-sign/sign.js#L120
    childPaths = childPaths.sort((a, b) => {
        const aDepth = a.split(path.sep).length
        const bDepth = b.split(path.sep).length
        return bDepth - aDepth
    });

    // Sign binaries
    childPaths.forEach(file => signFile(file, context.appOutDir));

    // Sign final app
    signFile(appName, context.appOutDir);
}
