const path = require('path');
const child_process = require('child_process');

exports.default = async function (context) {

    // Only continue for macOS
    if (context.packager.platform.name !== 'mac') {
        return;
    }

    const appPath = `${context.packager.appInfo.productFilename}.app`;
    const entitlements = path.resolve('..', 'entitlements.plist');
    const command = path.join(__dirname, 'sign.sh');

    child_process.execFileSync(command, [
        appPath,
        entitlements
    ], {
        cwd: context.appOutDir
    });
}
