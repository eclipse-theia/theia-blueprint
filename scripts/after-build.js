const path = require('path');
const child_process = require('child_process');

exports.default = async function (buildResult) {

    const appPath = buildResult.artifactPaths.find(artifactPath => path.extname(artifactPath) === '.dmg' || path.extname(artifactPath) === '.exe');

    if (!appPath) {
        console.log('Unable to find macOS or Windows installer to sign', buildResult.artifactPaths);
        return;
    }

    const command = path.join(__dirname, 'sign.sh');
    const entitlements = path.resolve(__dirname, '..', 'entitlements.plist');
    const output = path.join(path.dirname(appPath), `signed-${path.basename(appPath)}`);

    child_process.execFileSync(command, [
        appPath,
        entitlements,
        output
    ], {
        cwd: buildResult.outDir
    });
}
