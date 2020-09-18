const path = require('path');
const util = require('util');
const child_process = require('child_process');
const rimraf = require('rimraf');
const glob = require('glob');
const fse = require('fs-extra');

const asynfRimraf = util.promisify(rimraf);

const BINARY_EXTS = [
    '',
    '.node',
    '.dylib'
];

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

    // Find all executable files and sign them
    const files = glob.sync('**/*', { cwd: appPath, realpath: true });
    files.forEach(file => {
        const stat = fse.lstatSync(file);
        const isExecutableFile = stat.isFile() && (stat.mode & fse.constants.S_IXOTH);
        const pathParsed = path.parse(file);

        if (isExecutableFile && BINARY_EXTS.indexOf(pathParsed.ext) > -1) {
            console.log(`Signing ${file}...`);

            child_process.execFileSync(command, [
                file,
                entitlements
            ], {
                cwd: context.appOutDir
            });
        }
    });

    // Sign final app
    console.log(`Signing ${appName}...`);
    child_process.execFileSync(command, [
        appName,
        entitlements
    ], {
        cwd: context.appOutDir
    });
}
