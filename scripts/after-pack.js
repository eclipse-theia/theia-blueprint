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

const signFile = file => {
    console.log(`Signing ${file}...`);
    child_process.execFileSync(signCommand, [
        path.basename(file),
        entitlements
    ], {
        cwd: path.dirname(file)
    });
};

exports.default = async function(context) {
    // Remove anything we don't want in the final package
    for (const deletePath of DELETE_PATHS) {
        const resolvedPath = path.resolve(context.appOutDir, `${context.packager.appInfo.productFilename}.app`, deletePath);
        console.log(`Deleting ${resolvedPath}...`);
        await asynfRimraf(resolvedPath);
    }

    // Only continue for macOS
    if (context.packager.platform.name !== 'mac') {
        return;
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
}
