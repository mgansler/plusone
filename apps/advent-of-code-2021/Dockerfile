FROM node:24.11.0-alpine3.22
EXPOSE 3000/tcp
CMD ["npm", "start"]
WORKDIR /myapp

COPY ./dist/apps/advent-of-code-2021/package.json ./
RUN npm install

COPY ./dist/apps/advent-of-code-2021/ ./
