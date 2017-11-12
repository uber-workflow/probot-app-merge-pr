FROM node:8.9.0

WORKDIR /probot-app-merge-pr

COPY package.json /probot-app-merge-pr/

RUN npm install
