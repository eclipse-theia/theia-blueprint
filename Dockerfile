FROM node:12.19.0-stretch
RUN apt-get update && apt-get install -y libxkbfile-dev
