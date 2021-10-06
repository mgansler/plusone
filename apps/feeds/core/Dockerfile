FROM node:16-alpine
RUN apk add --no-cache --repository=http://dl-cdn.alpinelinux.org/alpine/edge/main libssl3
WORKDIR /usr/src/app
CMD ["./run-app.sh"]
EXPOSE 3333/tcp

COPY ./dist/apps/feeds/core/package.json .
RUN npm install --legacy-peer-deps

COPY ./apps/feeds/core/run-app.sh .
COPY ./dist/apps/feeds/core .
