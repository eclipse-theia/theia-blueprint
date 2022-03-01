# See the associated GitHub workflow, that builds and publishes
# this docker image to Docker Hub:
# .github/workflows/publish-builder-img.yml
# It can be triggered manually from the GitHub project page. 

# We still want Ubuntu 18.04 LTS compatibility, which is based on stretch
# -> install newer python version manually
FROM node:12.19.0-stretch
RUN apt-get update && apt-get install -y libxkbfile-dev libsecret-1-dev && \
    cd /tmp && \
    wget https://www.python.org/ftp/python/3.6.15/Python-3.6.15.tar.xz && \
    tar xvf Python-3.6.15.tar.xz && \
    cd Python-3.6.15 && \
    ./configure --enable-optimizations --enable-loadable-sqlite-extensions && \
    make -j 8 && \
    make altinstall && \
    update-alternatives --install /usr/bin/python3 python3 /usr/local/bin/python3.6 1