const path = require('path');
const util = require('util');
const child_process = require('child_process');
const rimraf = require('rimraf');

const asynfRimraf = util.promisify(rimraf);

const DELETE_PATHS = [
    'Contents/Resources/app/node_modules/unzip-stream/testData*'
];

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

    const command = path.join(__dirname, 'sign.sh');
    const entitlements = path.resolve(__dirname, '..', 'entitlements.plist');

    child_process.execFileSync(command, [
        appName,
        entitlements
    ], {
        cwd: context.appOutDir
    });
}
