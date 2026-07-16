FROM node:24.16.0-alpine3.22
RUN apk add --no-cache curl openssl
RUN corepack enable

WORKDIR /usr/feeds
RUN printf 'nodeLinker: node-modules\nenableScripts: true\n' > .yarnrc.yml
CMD ["sh", "./entrypoint.sh"]
EXPOSE 3333/tcp

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD curl -f http://localhost:3333/api/health || exit 1

COPY apps/feeds/feeds-app/entrypoint.sh .

COPY ./dist/apps/feeds/feeds-backend .
