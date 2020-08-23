const path = require('path');
const child_process = require('child_process');

exports.default = async function (buildResult) {

    const appPath = buildResult.artifactPaths.find(artifactPath => path.extname(artifactPath) === '.dmg' || path.extname(artifactPath) === '.exe');

    if (!appPath) {
        console.log('Unable to find macOS or Windows installer to sign', buildResult.artifactPaths);
        return;
    }

    const entitlements = path.resolve('..', 'entitlements.plist');
    const output = path.join(path.dirname(appPath), `signed-${path.basename(appPath)}`);
    const command = path.join(__dirname, 'sign.sh');

    child_process.execFileSync(command, [
        appPath,
        entitlements,
        output
    ], {
        cwd: buildResult.outDir
    });
}
