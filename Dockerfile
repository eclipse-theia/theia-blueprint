# See the associated GitHub workflow, that builds and publishes
# this docker image to Docker Hub:
# .github/workflows/publish-builder-img.yml
# It can be triggered manually from the GitHub project page. 

FROM node:12.19.0-stretch
RUN apt-get update && apt-get install -y libxkbfile-dev libsecret-1-dev
