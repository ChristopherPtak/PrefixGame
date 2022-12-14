
FROM alpine:3.16 AS build

RUN apk add make

WORKDIR /build
COPY Makefile /build/Makefile
COPY src /build/src
RUN make BUILD=/app 


FROM node:19.2.0-alpine3.16

COPY --from=build /app /app
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json

WORKDIR /app
RUN npm ci

CMD node /app/server.js

