const { getAppResourcePath } = require('theia-blueprint-browser/lib/node/theia-blueprint-application');
module.exports.rgPath = getAppResourcePath('node_modules/vscode-ripgrep/bin/rg' + (process.platform === 'win32' ? '.exe' : ''));
