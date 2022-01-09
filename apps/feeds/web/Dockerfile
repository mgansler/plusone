FROM node:17-alpine
EXPOSE 3000/tcp
CMD ["npm", "start"]
WORKDIR /feeds-web

COPY ./dist/apps/feeds/web/package.json ./
RUN npm install

COPY ./dist/apps/feeds/web/ ./
