const path = require('path');
const child_process = require('child_process');

exports.default = async function (context) {

    // Only continue for macOS
    if (context.packager.platform.name !== 'mac') {
        return;
    }

    const command = path.join(__dirname, 'sign.sh');
    const appPath = `${context.packager.appInfo.productFilename}.app`;
    const entitlements = path.resolve(__dirname, '..', 'entitlements.plist');

    console.log(command);
    console.log(appPath);
    console.log(entitlements);
    console.log(context.appOutDir);

    child_process.execFileSync(command, [
        appPath,
        entitlements
    ], {
        cwd: context.appOutDir
    });
}
