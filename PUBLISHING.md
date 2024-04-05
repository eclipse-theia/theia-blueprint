# Publishing

This guide contains the steps to publish a new version of the Theia IDE.

Every commit to master will be published as a preview version.
Updates will only work when there was a version change.

## Update Package Versions and Theia

If there was *no* Theia release we usually want to increment the patch version by 1, e.g. 1.47.100 -> 1.47.101.

If there was a new Theia *minor* release, e.g. 1.48.0, we want to use the same version as Theia.

If there was a new Theia *patch* release, e.g. 1.48.1, we use Theia's patch version multiplied by 100, e.g. 1.48.100.

```sh
# Update mono repo version
yarn version

# Update version of all packages
yarn lerna version --exact --no-push --no-git-tag-version

# If there was a Theia release, update Theia dependencies
yarn update:theia 1.48.0 && yarn update:theia:children 1.48.0

# Update yarn.lock
yarn
```

If there was a Theia Release

* check if there are any breaking changes
* check if new built-ins are available
* check if any changes were made to the sample applications (e.g. new packages or additional configuration)

and adapt the code/built-ins accordingly.

Next, update the `Jenkinsfile`'s `copyInstallerAndUpdateLatestYml` invocation for windows. Here we have to specficy for which olders versions we want to enable direct (incremental) updates to this version on Windows.\
See <https://download.eclipse.org/theia/ide-preview/> for the available old versions.\
*We plan to automate this, but at the moment it's a manual step.*

E.g.:\
`copyInstallerAndUpdateLatestYml('windows', 'TheiaIDESetup', 'exe', 'latest.yml', '1.46.0,1.46.100,1.47.0')`\
->\
`copyInstallerAndUpdateLatestYml('windows', 'TheiaIDESetup', 'exe', 'latest.yml', '1.46.0,1.46.100,1.47.0,1.47.100')`

Finally, open a PR with your changes.

## Upgrade Dependencies

We want to run `yarn upgrade` regularily to get the latest versions of our dependencies.
You may want to keep this in a separate PR as this might require IP Reviews from the Eclipse Foundation and may take some time.
After an upgrade you should check the used `electron` version in the `yarn.lock`.
If there was an update, update `electronVersion` in `applications/electron/electron-builder.yml` accordingly.

## Promote IDE from Preview to Stable Channel

You can promote the IDE via this [Build Job](https://ci.eclipse.org/theia/job/Theia%20-%20Promote%20IDE/).

In `VERSION` specfiy which version to copy from <https://download.eclipse.org/theia/ide-preview/>, e.g. 1.48.0.

In `TOUPDATE` specify the older versions for which you want to enable direct (incremental) updates on windows.\
See <https://download.eclipse.org/theia/ide/> for the old releases.
E.g. `1.45.0,1.46.100,1.47.100`.\
*We plan to automate this, but at the moment it's a required parameter.*

## Publish Docker Image

Run this [workflow](https://github.com/eclipse-theia/theia-blueprint/actions/workflows/publish-theia-ide-img.yml) from the master branch.
