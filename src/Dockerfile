FROM node:latest

ARG service_src

WORKDIR /usr/src
COPY package*.json ./
RUN npm install
COPY ${service_src} ./
CMD [ "npm", "run", "start" ]