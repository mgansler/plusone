FROM node:17-alpine
EXPOSE 3000/tcp
CMD ["npm", "start"]
WORKDIR /myapp

COPY ./dist/apps/advent-of-code-2021/ ./
RUN npm install
