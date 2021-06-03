FROM node:16-alpine
WORKDIR /usr/src/app
CMD ["node", "main.js"]
EXPOSE 3333/tcp

COPY ./dist/apps/feeds/fetch-ms/package.json .
RUN npm install --legacy-peer-deps

COPY ./dist/apps/feeds/fetch-ms .
