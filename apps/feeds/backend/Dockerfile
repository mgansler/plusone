FROM node:17-alpine
WORKDIR /usr/src/app
CMD ["npm", "start"]
EXPOSE 3333/tcp

COPY ./dist/apps/feeds/backend/package.json .
RUN npm install --legacy-peer-deps

COPY ./dist/apps/feeds/backend .
