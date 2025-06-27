FROM node:22.17.0-alpine
RUN apk add --no-cache curl openssl

WORKDIR /usr/feeds
CMD ["npm", "start"]
EXPOSE 3333/tcp

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD curl -f http://localhost:3333/api/health || exit 1

COPY ./dist/apps/feeds/feeds-backend/package.json .
COPY ./dist/apps/feeds/feeds-backend/yarn.lock .
RUN yarn install --frozen-lockfile

COPY ./dist/apps/feeds/feeds-backend .
