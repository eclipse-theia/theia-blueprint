/** @type {import('eslint').Linter.Config} */
module.exports = {
    root: true,
    extends: [
        './configs/base.eslintrc.json',
        './configs/warnings.eslintrc.json',
        './configs/errors.eslintrc.json',
        './configs/xss.eslintrc.json'
    ],
    ignorePatterns: [
        '**/{node_modules,lib}',
        'plugins'
    ],
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./configs/tsconfig.eslint.json', './theia-extensions/*/tsconfig.json', 'applications/electron/tsconfig.eslint.json']
    }
};
