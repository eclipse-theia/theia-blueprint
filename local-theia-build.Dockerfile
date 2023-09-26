# Prerequisites
# https://github.com/eclipse-theia/theia/blob/master/doc/Developing.md#prerequisites
FROM node:18.17.0
RUN apt-get update && \
    apt-get install -y \
    make \
    gcc \
    pkg-config \
    build-essential \
    libx11-dev \
    libxkbfile-dev \
    libsecret-1-dev && \
    # install local npm registry and helper tools
    yarn global add verdaccio && \
    apt-get install -y expect-dev netcat-openbsd && \
    mkdir /tmp/verdaccio && chmod 777 /tmp/verdaccio && \
    # create some common default directories/files with write access for any user
    touch /.yarnrc && chmod 777 /.yarnrc && \
    touch /.npmrc && chmod 777 /.npmrc && \
    mkdir /.cache && chmod 777 /.cache && \
    mkdir /.yarn && chmod 777 /.yarn && \
    mkdir /.npm && chmod 777 /.npm

# Set storage location for verdaccio
ENV VERDACCIO_STORAGE_PATH /tmp/verdaccio

# Switch to expected workdir
WORKDIR /tmp

COPY adduser /tmp/adduser
COPY loginuser /tmp/loginuser
COPY entrypoint /tmp/entrypoint

ENTRYPOINT ["/tmp/entrypoint"]