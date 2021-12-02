FROM node:17-alpine
EXPOSE 3000/tcp
WORKDIR /myapp
RUN npm i @remix-run/react @remix-run/serve @remix-run/dev react react-dom remix
RUN ./node_modules/.bin/remix setup node
CMD ["./node_modules/.bin/remix-serve", "build"]

COPY ./apps/advent-of-code-2021/build ./build
COPY ./apps/advent-of-code-2021/public ./public
