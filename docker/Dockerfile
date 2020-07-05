FROM node:latest


RUN mkdir -p /_install
WORKDIR /_install
COPY . .

RUN apt update && apt install -y git
RUN npm install
RUN npm run build
