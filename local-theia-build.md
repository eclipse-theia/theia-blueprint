# Local Theia Build

## Prerequisites

You can create an image with all required tools to build theia and to host your temporary next builds with this command:

```sh
docker build -t local-theia-builder -f local-theia-build.Dockerfile ./docker/local-theia-build
```

## Example Local Build

```sh
# switch to your checked out theia code
cd ~/git/theia
# Cleaning any locals build results is advied. Please be sure to commit any changes before cleaning.
git clean -xfd

# Export location where to save the built results
# Please make sure that this location exists
export VERDACCIO_STORAGE_PATH="/home/user/tmp/verdaccio"

# build Theia Next with our builder image
#
# This command mounts your theia directory (${PWD}) inside the container
#
# The built results will be available at $VERDACCIO_STORAGE_PATH
# You may omit this volume mount, however the build results will the be local to the docker container
# 
# --addUser adds a user in the verdaccio registry. This can be omitted if a VERDACCIO_STORAGE_PATH with a preexisting user is mounted
#
# --buildTheia can be omitted if you don't want to build theia but just want to serve the existing results at VERDACCIO_STORAGE_PATH
#
docker run --rm \
    -v ${PWD}:/tmp/theia \
    -v ${VERDACCIO_STORAGE_PATH}:/tmp/verdaccio  \
    -u $(id -u ${USER}):$(id -g ${USER}) \
    -p=4873:4873 \
    local-theia-builder --addUser --buildTheia

# in a new shell, open theia blueprint
cd ~/git/theia-blueprint

# update theia version to @next
yarn && yarn update:next

# run yarn with verdaccio registry to update yarn.lock
yarn --registry http://localhost:4873/

# build theia blueprint
yarn build && yarn electron package

```
