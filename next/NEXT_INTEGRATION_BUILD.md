# Integration build against Theia@next

The master branch has a script that may be used to update all theia versions to `next`. This may be executed running `yarn update:next` in the repository root.
We will set up an integration job that will build Blueprint against Theia@next so that we may identify breaking changes early.

## Build process

* Check out the master branch containing all of the latest changes.
* Merge the next branch into the checked out branch. The next branch will only contain fixes that are required to build against the `next` version (e.g. a method was renamed and causes compile errors)
* Run `yarn update:next` (may have been exectued on `next` already but not necessarily)
* Build blueprint and run the tests
* In case of an error notify responsible persons via e-mail

This process should make sure that we always include all of the latest changes (by using the master branch as a starting point for the build) and only have to maintain fixes (on the `next` branch) in case of actual problems.

## In case of errors

* Analyse the issue and open a bug report
* Either fix the issue (open a PR and merge to `next` branch) or create some kind of hotfix for the `next` branch to get a green build.
