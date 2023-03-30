FROM node:19-alpine
EXPOSE 3000/tcp
CMD ["npm", "start"]
WORKDIR /myapp

COPY ./dist/apps/advent-of-code-2021/package.json ./
RUN npm install

COPY ./dist/apps/advent-of-code-2021/ ./
