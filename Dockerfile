FROM node:10.17.0-buster-slim
RUN apt-get update && apt-get install -y libxkbfile-dev
