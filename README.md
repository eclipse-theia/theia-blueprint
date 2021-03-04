<br/>
<div id="theia-logo" align="center">
    <br />
    <img src="https://raw.githubusercontent.com/eclipse-theia/theia/master/logo/theia-logo.svg?sanitize=true" alt="Theia Logo" width="300"/>
    <h3>Cloud & Desktop IDE Platform</h3>
</div>

<div id="badges" align="center">

Eclipse Theia is an extensible platform to develop full-fledged multi-language Cloud & Desktop IDE-like products with state-of-the-art web  technologies.

</div>

[![Installers](https://img.shields.io/badge/download-installers-blue.svg?style=flat-curved)](https://download.eclipse.org/theia/)

[Main Theia Repository](https://github.com/eclipse-theia/theia)

[Visit the Theia website](http://www.theia-ide.org) for more [documentation](http://www.theia-ide.org/doc).

## License

- [Eclipse Public License 2.0](LICENSE)
- [一 (Secondary) GNU General Public License, version 2 with the GNU Classpath Exception](LICENSE)

## Trademark
"Theia" is a trademark of the Eclipse Foundation
https://www.eclipse.org/theia

## What is this?

Eclipse Theia Blueprint product is a **template** to showcase the capabilities of Theia as well as how to build desktop-based products based on the platform. Theia Blueprint assembles a selected subset of existing Theia features and extensions. We provide installers for Theia Blueprint to be downloaded (see below) as well as documentation on how to customize this template to build a product and installers for your own Theia-based product.

## What is it not?

Eclipse Theia Blueprint product is ***not*** **a production-ready product**. Therefore, it is also not a replacement for Visual Studio Code or any other IDE.

## Development

### Repository structure

- Root level configures mono-repo build with lerna
- `electron-app` contains app to package, packaging configuration, and E2E tests.
- `theia-blueprint-product` contains a Theia extension contributing the product branding (about dialogue and welcome page).
- `theia-blueprint-updater` contains a Theia extension contributing the update mechanism and corresponding UI elements (based on the electron updater).

### Build

```sh
yarn
```

### Package the application

```sh
yarn package
```

The packaged application is located in `electron-app/dist`.

### Create a preview application (without packaging it)

```sh
yarn package:preview
```

The packaged application is located in `electron-app/dist`.

### Running E2E Tests

The E2E tests basic UI tests of the actual application.
This is done based on the preview of the packaged application.

```sh
yarn package:preview
(cd electron-app && yarn test)
```

### Troubleshooting

- [_"Don't expect that you can build app for all platforms on one platform."_](https://www.electron.build/multi-platform-build)

### Reporting feature requests and bugs

The features in the Eclipse Theia Blueprint product are based on Theia and the included extensions/plugins. For bugs in Theia please consider opening an issue in the [Theia project on Github](https://github.com/eclipse-theia/theia/issues/new/choose). 
Eclipse Theia Blueprint product only packages existing functionality into a product and installers for the product. If you believe there is a mistake in packaging, something needs to be added to the packaging or the installers do not work properly, please [open an issue on Github](https://github.com/eclipse-theia/theia-blueprint/issues/new/choose) to let us know.