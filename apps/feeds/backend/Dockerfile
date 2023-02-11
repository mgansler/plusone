FROM node:18-alpine
WORKDIR /usr/src/app
CMD ["npm", "start"]
EXPOSE 3333/tcp

COPY ./dist/apps/feeds/backend/package.json .
COPY ./dist/apps/feeds/backend/yarn.lock .
RUN yarn install --frozen-lockfile

COPY ./dist/apps/feeds/backend .
