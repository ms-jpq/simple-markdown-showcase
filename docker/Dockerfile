FROM node:latest


RUN mkdir -p /_install
WORKDIR /_install
COPY . .


RUN npm install
RUN npm build
