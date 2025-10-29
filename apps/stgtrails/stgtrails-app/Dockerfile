FROM node:22.21.1-alpine
RUN apk add --no-cache curl openssl

WORKDIR /usr/stgtrails
CMD ["npm", "start"]
EXPOSE 3104/tcp

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD curl -f http://localhost:3104/api/health || exit 1

COPY ./dist/apps/stgtrails/stgtrails-backend/package.json .
COPY ./dist/apps/stgtrails/stgtrails-backend/yarn.lock .
RUN yarn install --frozen-lockfile

COPY ./dist/apps/stgtrails/stgtrails-backend .
