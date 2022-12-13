
FROM node:19.2.0-alpine

COPY data /app/data
COPY static /app/static
COPY package.json /app/package.json
COPY server.js /app/server.js

WORKDIR /app
RUN npm install

CMD node /app/server.js

