FROM node:latest

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install

COPY . /usr/src/app

EXPOSE 80

ENV SQLITE_PATH=./db/database.db
ENV JWT_SECRET jwtscreats

CMD [ "npm", "run", "microservice", "--", "--port", "80", "--log-level", "debug", "--prefix", "/api/user", "user/index.js" ]
