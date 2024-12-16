# This is for a dev containers test
FROM node:22.12-alpine3.20
WORKDIR /user/src/app
COPY . .
RUN npm install

