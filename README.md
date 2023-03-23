<br/>
<div id="theia-logo" align="center">
    <br />
    <img src="https://raw.githubusercontent.com/eclipse-theia/theia-blueprint/master/theia-extensions/theia-blueprint-product/src/browser/icons/TheiaBlueprintLogo-blue.png" alt="Theia Logo" width="300"/>
    <h3>Eclipse Theia Blueprint</h3>
</div>

<div id="badges" align="center">

Eclipse Theia Blueprint is a template for building desktop-based products based on the Eclipse Theia platform.

</div>

[![Installers](https://img.shields.io/badge/download-installers-blue.svg?style=flat-curved)](https://theia-ide.org/docs/blueprint_download/)
[![Build Status](https://ci.eclipse.org/theia/buildStatus/icon?subject=latest&job=Theia2%2Fmaster)](https://ci.eclipse.org/theia/job/Theia2/job/master/)
[![Build Status](https://ci.eclipse.org/theia/buildStatus/icon?subject=next&job=theia-next%2Fmaster)](https://ci.eclipse.org/theia/job/theia-next/job/master/)

[Main Theia Repository](https://github.com/eclipse-theia/theia)

[Visit the Theia website](http://www.theia-ide.org) for more [documentation](https://theia-ide.org/docs/blueprint_documentation/).

## License

- [Eclipse Public License 2.0](LICENSE)
- [一 (Secondary) GNU General Public License, version 2 with the GNU Classpath Exception](LICENSE)

## Trademark

"Theia" is a trademark of the Eclipse Foundation
https://www.eclipse.org/theia

## What is this?

Eclipse Theia Blueprint is a **template** for building desktop-based products based on the Eclipse Theia platform, as well as to showcase Eclipse Theia capabilities. It is made up of a subset of existing Eclipse Theia features and extensions and can be easily downloaded and installed on all major operating system platforms (see below). Documentation is available to help you customize and build your own Eclipse Theia-based product.

## What is it not?

Eclipse Theia Blueprint is ***not*** **a production-ready product**. Therefore, it is also not meant to be a replacement for Visual Studio Code or any other IDE.

## Development

### Requirements
Please check Theia's [prerequisites](https://github.com/eclipse-theia/theia/blob/master/doc/Developing.md#prerequisites), and keep node versions aligned between Theia Blueprint and that of the referenced Theia version.

### Documentation

Documentation on how to package Theia as a Desktop Product may be found [here](https://theia-ide.org/docs/blueprint_documentation/)

### Repository Structure

- Root level configures mono-repo build with lerna
- `applications` groups the different app targets
  - `browser` contains a browser based version of Eclipse Theia Blueprint that may be packaged as a Docker image
  - `electron` contains the electron app to package, packaging configuration, and E2E tests for the electron target.
- `theia-extensions` groups the various custom theia extensions for Blueprint
  - `theia-blueprint-product` contains a Theia extension contributing the product branding (about dialogue and welcome page).
  - `theia-blueprint-updater` contains a Theia extension contributing the update mechanism and corresponding UI elements (based on the electron updater).

### Build

```sh
yarn
```

### Package the Electron Application

```sh
yarn electron package
```

The packaged application is located in `applications/electron/dist`.

### Create a Preview Electron Application (without packaging it)

```sh
yarn electron package:preview
```

The packaged application is located in `applications/electron/dist`.

### Running E2E Tests on Electron

The E2E tests basic UI tests of the actual application.
This is done based on the preview of the packaged application.

```sh
yarn electron package:preview
yarn electron test
```

### Running Browser app

The browser app may be started with

```sh
# Download Plugins for browser app
yarn browser download:plugins

# Start browser app
yarn browser start
```

and connect to <http://localhost:3000/>

### Troubleshooting

- [_"Don't expect that you can build app for all platforms on one platform."_](https://www.electron.build/multi-platform-build)

### Reporting Feature Requests and Bugs

The features in Eclipse Theia Blueprint are based on Theia and the included extensions/plugins. For bugs in Theia please consider opening an issue in the [Theia project on Github](https://github.com/eclipse-theia/theia/issues/new/choose).
Eclipse Theia Blueprint only packages existing functionality into a product and installers for the product. If you believe there is a mistake in packaging, something needs to be added to the packaging or the installers do not work properly, please [open an issue on Github](https://github.com/eclipse-theia/theia-blueprint/issues/new/choose) to let us know.

### Docker Build

You can create a Docker Image for Blueprint based on the browser app with the following build command:

```sh
docker build -t theia-blueprint -f browser.Dockerfile .
```

You may then run this with

```sh
docker run -p=3000:3000 --rm theia-blueprint
```

and connect to <http://localhost:3000/>
