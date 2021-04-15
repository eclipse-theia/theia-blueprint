# Theia Blueprint Web
## Setup

This package defines a Browser Theia Application based on Blueprint.

In order to bundle it and package it as a distributable executable, a few
transformations are performed:

1. The `gen-webpack.config.js` script was copied to `web-webpack.config.js` and
   converted to work with Webpack v5.
2. A new `node-webpack.config.js` script was added to bundle all of the Node
   application bits together under `bundled/`. Quite a lot of magic is happening
   in that config, which points to modifications to do to the framework in order
   to better support packaging of the node version. See `TODO` below.
3. We are using `pkg` on the bundle to make it into an executable. Since
   everything cannot be packed into the final exe, folders like `lib`,
   `builtins` and `node_modules` must be copied on the side.

We still have to deal with a residual `node_modules` because of 2 packages:

1. `drivelist` uses the `bindings` package which doesn't seem to work when
   bundled or packaged, so we leave it out of the executable.
2. `vscode-ripgrep` pulls a compiled version of `ripgrep` and it has to be
   accessible on the disk for the system to spawn it.

## Submodules

`pkg` has a bug that prevents scripts from forking with some `execArgv` options.
I implemented a workaround on a fork and opened a PR for it as well, see
https://github.com/vercel/pkg/pull/1157.

Until this is merged, I added my fork of `pkg` as a submodule to make use of it.

You need to make sure that the submodule is initiliazed when working on Theia
Blueprint Web:

```sh
git submodule update --init
```

# TODO

## Blueprint

### Remove `@theia/git` (optional)

If I understand correctly, there is a Git VS Code extension out there that can
replace Theia's git extension. It would simplify the Webpack config ever so
slightly to use the VS Code extension instead.

## Theia Framework

### Refactor the way the frontend is served so that it can be customized (recommended)

We expect to run the backend from `<root>/src-gen/backend/main.js` and we refer
to the frontend files as `'../../lib'` relative to that script. When packaged,
the backend must serve files located at `'./lib'` instead. Since our generators
are currently hard-coded this is problematic.

### Provide a module loader script to avoid direct calls to `require` (mandatory)

This is especially an issue with dynamic requires. Webpack tries its best to
statically bundle everything together, and we need a special configuration to
handle dynamic `require` calls (`require(someVar)`). Extracting and factorizing
this function into its own module will ease packaging since we will be able to
provide a module replacement when bundling the application.

I considered using DI instead and have some `ModuleLoader` component injected in
places that do dynamic imports, but it appears that we need to cover places
where DI is not available... Webpack provides a way to replace imported modules,
so it would make sense to use that strategy here where we would import a dynamic
import function from a separate file, and replace that file with the proper
implementation when packaging.

### Expose/declare entrypoints (optional)

The backend spawns various child processes, and we need to know precisely what
is spawned so that we can tell Webpack to create the right entrypoints for it.
Backend modules should declare those to make it easier to package.

### Use Webpack v5 (recommended)

In order to split and re-use chunks between the various entrypoints we need
to move from Webpack v4 to Webpack v5.

See https://github.com/webpack/webpack/pull/8575/commits/f446bf8a9b6b718977d24ed402b8a1884d663622

### Remove references to `process.env` in browser code (recommended)

It surprised me to find this. Moving to Webpack v5 exposed this oddity in
`@theia/terminal/src/browser/terminal-preferences.ts`...

### Provide a better way to detect the application's installation (recommended)

We currently rely on `process.cwd()` which is a pretty bad way of guessing where
an application lives. "Current working directory" represents in fact the place
where the program was invoked from, it has nothing to do with the application's
installation location. We should look into a better heuristic, or at least a
customizable one.
