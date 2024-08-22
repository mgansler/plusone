FROM node:20.17.0-alpine
WORKDIR /usr/src/app
CMD ["npm", "start"]
EXPOSE 3104/tcp

COPY ./dist/apps/stgtrails/stgtrails-backend/package.json .
COPY ./dist/apps/stgtrails/stgtrails-backend/yarn.lock .
RUN yarn install --frozen-lockfile

COPY ./dist/apps/stgtrails/stgtrails-backend .
COPY ./dist/apps/stgtrails/stgtrails-web/ web
RUN sed -i 's#file:./stgtrails.db#file:/usr/stgtrails/sqlite/stgtrails.db#' schema.prisma
