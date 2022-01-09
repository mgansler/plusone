FROM node:17-alpine
EXPOSE 3000/tcp
CMD ["npm", "start"]
WORKDIR /feeds-web

COPY ./dist/apps/feeds/web/ ./
RUN npm install
